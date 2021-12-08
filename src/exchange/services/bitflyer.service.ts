/* eslint-disable prettier/prettier */
import { HttpException, HttpService, HttpStatus, Injectable } from '@nestjs/common';
import { map, filter, mergeMap, toArray, concatMap, reduce, catchError } from 'rxjs/operators';
import { BotConfigService } from '../../services/configs/botconfigs.service';
import { Observable, of, throwError } from 'rxjs';
import { ExchangeService } from '../exchange.service';
import * as crypto from 'crypto';
import { forkJoin } from 'rxjs';
import { SecretsService } from '../../services/secrets/secrets.service';
import { BitFlyerAsset, BitFlyerBalance, BitFlyerSignature } from './bitflyer.entities';
import { Dip, OrderType } from '../entities/exchange';
// import { request } from 'gaxios';

@Injectable()
export class BitFlyerExchange extends ExchangeService {
  baseURL = 'https://api.bitflyer.com';
  key = '';
  secret = '';

  constructor(httpService: HttpService, private configs: BotConfigService, secretService: SecretsService) {
    super(httpService, secretService);
    if (configs.tradeCurrency !== 'JPY') {
      throw new HttpException(
        'BitFlyer module currently supports only JPY based trading pairs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async initSecrets(): Promise<void> {
    const apiKeyName: string = this.configs.settings.api_keyname;
    const secretKeyName: string = this.configs.settings.secret_keyname;

    if (this.secret === '' || this.key === '') {
      this.key = await this.secretService.getSecret(apiKeyName);
      this.secret = await this.secretService.getSecret(secretKeyName);
    }
  }

  private async createSignature(method: string, path: string, body?: string): Promise<BitFlyerSignature> {
    await this.initSecrets();
    const timestamp = Date.now().toString();
    const bodyString = body ?? '';
    const text = timestamp + method + path + bodyString;
    const signature = crypto.createHmac('sha256', this.secret).update(text).digest('hex');
    return {
      'ACCESS-KEY': this.key,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-SIGN': signature,
      'Content-Type': 'application/json'
    };
  }

  getPrice(ofProduct: string, priceIn: string): Observable<BitFlyerAsset> {
    const path = '/v1/ticker';
    const response = this.httpService.get(`${this.baseURL}${path}?product_code=${ofProduct}_${priceIn}`);
    const price = response.pipe(
      map((x) => x.data),
      map((x) => {
        if (x.product_code !== `${ofProduct}_${priceIn}`) {
          console.error('Price info returned different from what is requested.');
          throw new HttpException('Failed to get price info', HttpStatus.EXPECTATION_FAILED);
        }
        try {
          const DIVIDER = 2.0;
          const newPrice = (parseFloat(x.best_bid) + parseFloat(x.best_ask)) / DIVIDER;
          if (isNaN(newPrice)) {
            throw Error('NaN');
          }

          return {
            amount: newPrice,
            currency_code: priceIn
          };
        } catch {
          throw new HttpException('Failed to get price info', HttpStatus.BAD_REQUEST);
        }
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
    return price;
  }

  async getBalance(priceIn: string): Promise<BitFlyerBalance> {
    const path = '/v1/me/getbalance';
    const signature: any = await this.createSignature('GET', path);
    const response = this.httpService.get(`${this.baseURL}${path}`, {
      headers: signature
    });

    const ZERO_AMOUNT = 0;
    const balances = response.pipe(
      mergeMap((x) => x.data),
      filter((x: any) => x.amount > ZERO_AMOUNT),
      toArray<BitFlyerAsset>(),
      catchError((err) => {
        console.error(err.response.data);
        return throwError(err);
      })
    );

    const total = balances.pipe(
      mergeMap((item) => item),
      concatMap((item) => {
        if (item.currency_code !== priceIn) {
          return this.getPrice(item.currency_code, priceIn);
        }
        return of(item);
      }),
      reduce(
        (current, x) => {
          current.amount = current.amount + x.amount;
          return current;
        },
        {
          currency_code: priceIn,
          amount: 0
        }
      )
    );

    return forkJoin({
      balances: balances,
      total: total
    }).toPromise();
  }

  async buy(
    asset: string,
    using: string,
    mode: OrderType = OrderType.Market,
    amount?: number,
    price?: number
  ): Promise<any> {
    // -- get balance, compute total asset, allocate
    // -- if amount is not specified, getBalance and check rebalancing configuration
    if (amount === undefined) {
      try {
        const myAsset = await of(await this.getBalance(using))
          .pipe(
            map((x) => x.total),
            filter((x) => x.currency_code === using)
          )
          .toPromise();

        amount = myAsset.amount;
        const ratio =
          // eslint-disable-next-line no-magic-numbers
          this.configs.rebalanceProfiles?.filter((x) => x.asset === asset).map((x) => x.ratio as number)[0] ?? 1;

        amount = amount * ratio;
      } catch (error) {
        throw new HttpException('Could not calculate total available asset', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const NUM_DECIMAL = 8;
    const path = '/v1/me/sendchildorder';
    let requestBody = {
      product_code: `${asset}_${using}`,
      child_order_type: mode,
      side: 'BUY',
      // https://bitflyer.com/en-jp/faq/4-27
      size: amount.toFixed(NUM_DECIMAL),
      time_in_force: 'GTC'
    };
    console.log(requestBody);
    if (mode === OrderType.Limit) {
      requestBody = Object.assign({ price: price }, requestBody);
    }
    const requestBodyString = JSON.stringify(requestBody);
    const signature: any = await this.createSignature('POST', path, requestBodyString);
    const response = this.httpService
      .post(this.baseURL + path, requestBodyString, {
        headers: signature
      })
      .pipe(
        map((item) => item.data),
        catchError((err) => {
          console.error(err.response.data);
          return throwError(err);
        })
      )
      .toPromise();

    return response;
  }

  async sell(asset: string, sellFor: string, amount?: number): Promise<any> {
    if (amount === undefined) {
      try {
        const myAsset = await of(await this.getBalance(sellFor))
          .pipe(
            mergeMap((x) => x.balances),
            filter((x) => x.currency_code === asset)
          )
          .toPromise();

        amount = myAsset.amount;
      } catch (error) {
        throw new HttpException('Could not find an asset to sell.', HttpStatus.EXPECTATION_FAILED);
      }
    }

    const path = '/v1/me/sendchildorder';
    const NUM_DECIMALS = 8;
    const requestBody = JSON.stringify({
      product_code: `${asset}_${sellFor}`,
      child_order_type: 'MARKET',
      side: 'SELL',
      // https://bitflyer.com/en-jp/faq/4-27
      size: amount.toFixed(NUM_DECIMALS),
      time_in_force: 'GTC'
    });
    console.log(requestBody);
    const signature: any = await this.createSignature('POST', path, requestBody);
    const response = this.httpService
      .post(this.baseURL + path, requestBody, {
        headers: signature
      })
      .pipe(
        map((item) => item.data),
        catchError((err) => {
          console.error(err.response.data);
          return throwError(err);
        })
      )
      .toPromise();

    return response;
  }

  async clear(asset: string, denominator: string): Promise<any> {
    const path = '/v1/me/cancelallchildorders';
    const requestBody = JSON.stringify({
      product_code: `${asset}_${denominator}`
    });
    console.log(requestBody);
    const signature: any = await this.createSignature('POST', path, requestBody);
    const response: any = this.httpService
      .post(this.baseURL + path, requestBody, {
        headers: signature
      })
      .pipe(
        map((item) => item.data),
        catchError((err) => {
          console.error(err.response.data);
          return throwError(err);
        })
      )
      .toPromise();

    return response;
  }

  async bidDips(asset: string, using: string, dipConfig: Dip[]): Promise<any> {
    try {
      await this.clear(asset, using);
      const myAsset = await this.getBalance(using);
      const assetPrice = await this.getPrice(asset, using).toPromise();
      // eslint-disable-next-line no-magic-numbers
      const buyingAsset = myAsset.balances.filter((item) => item.currency_code === using)[0];
      await Promise.all(
        dipConfig.map(async (dip) => {
          const PERCENT = 100;
          const funds = buyingAsset.available * (dip.allocation / PERCENT);
          // eslint-disable-next-line no-magic-numbers
          const price = Math.floor(assetPrice.amount * (1 - dip.percent / PERCENT));
          // eslint-disable-next-line no-magic-numbers
          const unit = parseFloat((funds / price).toPrecision(4));
          return this.buy(asset, using, OrderType.Limit, unit, price);
        })
      );
      return { status: 200, data: 'OK' };
    } catch (err) {
      await this.clear(asset, using);
      throw new HttpException('Dip bids failed.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
