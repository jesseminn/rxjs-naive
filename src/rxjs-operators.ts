import {
  Observable,
  Subscriber,
  Observer,
  Subscription,
  Subject,
  ConnectableObservable,
} from './rxjs';

export type Operator<T, U> = {
  (observable: Observable<T>): Observable<U>;
};

export type OperatorFactory = {
  (...args: any[]): Operator<any, any>;
};

export type Project<T, U> = {
  (v: T): U;
};

type Enhancer<T> = (subscriber: Subscriber<T>) => Observer<T>;
export const enhance: OperatorFactory = <T>(enhancer: Enhancer<T>) => (
  observable: Observable<T>
) => {
  return new Observable(subscriber => {
    const observer = enhancer(subscriber);
    return observable.subscribe(observer);
  });
};

export const map: OperatorFactory = (project: Project<any, any>) =>
  enhance(subscriber => {
    return {
      next(v) {
        subscriber.next(project(v));
      },
      error(err) {
        subscriber.error(err);
      },
      complete() {
        subscriber.complete();
      },
    };
  });

export const mergeMap: OperatorFactory = (
  project: Project<any, Observable<any>>
) =>
  enhance(subscriber => {
    return {
      next(v) {
        const innerObservable = project(v);
        return innerObservable.subscribe({
          next(v) {
            return subscriber.next(v);
          },
          error(err) {
            return subscriber.error(err);
          },
          complete() {
            return subscriber.complete();
          },
        });
      },
      error(err) {
        return subscriber.error(err);
      },
      complete() {
        return subscriber.complete();
      },
    };
  });

export const switchMap: OperatorFactory = project => {
  let currentSubscription: Subscription<any>;
  return enhance(subscriber => {
    return {
      next(v) {
        if (currentSubscription) {
          currentSubscription.unsubscribe();
        }
        const innerObservable = project(v);
        innerObservable.subscribe({
          next(v) {
            subscriber.next(v);
          },
        });
      },
      error(err) {},
      complete() {},
    };
  });
};

export const multicast: OperatorFactory = <T>(
  subject: Subject<T>
) => observable => {
  return new ConnectableObservable(observable, subject);
};

export const refCount = () => {
  // More complex than I expected...
  // check
  // https://rxjs-dev.firebaseapp.com/api/index/class/ConnectableObservable
  // https://github.com/ReactiveX/rxjs/blob/6.5.2/src/internal/operators/refCount.ts#L7-L65
  return (observable: Observable<any>) => {
    return new Observable(subscriber => {});
  };
};

export const publish: OperatorFactory = () => observable => {
  return new ConnectableObservable(observable, new Subject());
};
