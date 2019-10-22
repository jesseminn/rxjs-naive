import './styles.css';
import { Observable, Subject } from './rxjs';
import { map, mergeMap, multicast, refCount } from './rxjs-operators';

document.getElementById('app').innerHTML = `
  <h2>Todo</h2>
  <ul>
    <li>
      Add \`observerOrNext\`
      <p>
      https://blog.jerry-hong.com/series/rxjs/thirty-days-RxJS-26/
      </p>
      <p>
      https://blog.jerry-hong.com/series/rxjs/thirty-days-RxJS-27/
      </p>
      
    </li>
    <li>implement \`refCount\`</li>
    <li>Add test cases</li>
  </ul>
`;

// Observable.of(1, 2, 3)
//   .pipe(map(v => v * 2))
//   .subscribe({
//     next(v) {
//       console.log('map', v);
//     },
//   });

// Observable.of(1, 2, 3)
//   .pipe(mergeMap(v => Observable.of(v * 2)))
//   .subscribe({
//     next(v) {
//       console.log('mergeMap', v);
//     },
//   });

// const subject$ = new Subject();
// subject$.subscribe({
//   next(v) {
//     console.log('#1', v);
//   },
// });
// subject$.subscribe({
//   next(v) {
//     console.log('#2', v * 2);
//   },
// });

// subject$.next(1);
// subject$.next(2);

// const connectableOb$ = Observable.interval(1000).pipe(multicast(new Subject()));
// connectableOb$.subscribe({
//   next(v) {
//     console.log('subecriber 1', v);
//   },
// });

// connectableOb$.connect();

// setTimeout(() => {
//   connectableOb$.subscribe({
//     next(v) {
//       console.log('subecriber 2', v);
//     },
//   });
// }, 2000);

// const shared$ = Observable.interval(1000).pipe(multicast(new Subject()), refCount());
// // should start emit value
// shared$.subscribe({
//   next(v) {
//     console.log(v)
//   }
// })
