// A plain object, passed to `.subscribe()` method
export type Observer<T> = {
  next: (v: T) => void;
  error?: (error: Error) => void;
  complete?: () => void;
};

// The function for Observable constructor
export type Subscribe<T> = {
  (subscriber: Subscriber<T>): void;
};

export class Subscriber<T> {
  // the real implementation puts observer into `destination`
  // I wanna keep this part simple
  private _observer: Observer<T>;
  // true when complete
  private closed: boolean;
  // true when complete and error
  private isStopped: boolean;
  constructor(observer: Observer<T>) {
    this._observer = observer;
    this.closed = false;
    this.isStopped = false;
  }

  next(v: T) {
    if (!(this instanceof Subscriber)) {
      console.error(
        'next needs to be called withing the context of the Subscriber instance'
      );
      return;
    }
    if (this.isStopped || this.closed) {
      return;
    }
    this._observer.next(v);
  }

  error(error: Error) {
    if (!(this instanceof Subscriber)) {
      console.error(
        'error needs to be called withing the context of the Subscriber instance'
      );
      return;
    }
    if (this.isStopped || this.closed) {
      return;
    }
    this._observer.error(error);
    this.isStopped = true;
  }

  complete() {
    if (!(this instanceof Subscriber)) {
      console.error(
        'complete needs to be called withing the context of the Subscriber instance'
      );
      return;
    }
    if (this.isStopped || this.closed) {
      return;
    }
    if (typeof this._observer.complete !== 'function') {
      return;
    }
    this._observer.complete();
    this.isStopped = true;
    this.closed = true;
  }
}

export class Subscription<T> {
  private _subscriber: Subscriber<T>;
  constructor(subscriber: Subscriber<T>) {
    this._subscriber = subscriber;
  }
  unsubscribe() {
    this._subscriber.complete();
  }
}

export class Observable<T> {
  // Temporary store the subscribe logic here.
  // Triggered by `.subscribe()` method
  private _subscribe: Subscribe<T>;
  constructor(subscribe: Subscribe<T>) {
    this._subscribe = subscribe;
  }

  pipe(...operators: Operator<T, any>[]) {
    if (!(this instanceof Observable)) {
      console.error(
        'pipe needs to be called within the context of Observable instance'
      );
    }
    return operators.reduce((currentObservable, operator) => {
      return operator(currentObservable);
    }, this);
  }

  subscribe(observer: Observer<T>) {
    if (!(this instanceof Observable)) {
      console.error(
        'subscribe needs to be called within the context of Observable instance'
      );
    }
    // create an *subscriber* from the observer
    const subscriber = new Subscriber(observer);
    this._subscribe(subscriber);
    return new Subscription(subscriber);
  }

  static of(...args: any[]) {
    return new Observable(subscriber => {
      args.forEach(v => subscriber.next(v));
      subscriber.complete();
    });
  }

  static interval(time: number) {
    return new Observable(subscriber => {
      let count = 0;
      setInterval(() => {
        subscriber.next(count);
        count += 1;
      }, time);
    });
  }
}

export class Subject<T> {
  private _subscribers: Subscriber<T>[] = [];
  private _observable: Observable<T>;
  constructor() {
    const observable = new Observable(subscriber => {
      this._subscribers.push(subscriber);
    });
    this._observable = observable;
  }
  subscribe(observer: Observer<T>) {
    return this._observable.subscribe(observer);
  }
  next(v) {
    this._subscribers.forEach(subscriber => subscriber.next(v));
  }
  error(err) {
    this._subscribers.forEach(subscriber => subscriber.error(err));
  }
  complete() {
    this._subscribers.forEach(subscriber => subscriber.complete());
  }
}

export class ConnectableObservable<T> extends Observable<T> {
  private _source: Observable<T>;
  private _subject: Subject<T>;
  _refCount: number = 0;
  constructor(source: Observable<T>, subject: Subject<T>) {
    super(_ => {
      /* do nothing */
    });
    this._source = source;
    this._subject = subject;
  }

  subscribe(observer: Observer<T>) {
    // subscribes to the subject, not the observable
    return this._subject.subscribe(observer);
  }

  connect() {
    const subject = this._subject;
    this._source.subscribe({
      next(v) {
        subject.next(v);
      },
      error(err) {
        subject.error(err);
      },
      complete() {
        subject.complete();
      },
    });
  }
}
