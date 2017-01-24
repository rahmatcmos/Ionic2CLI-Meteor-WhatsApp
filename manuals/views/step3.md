[{]: <region> (header)
# Step 3: RxJS
[}]: #
[{]: <region> (body)
## RxJS 

To get started and understand RxJS, we recommend reading [this post](http://blog.angular-university.io/functional-reactive-programming-for-angular-2-developers-rxjs-and-observables/).

### TL;DR

RxJS is a library that allows us to easily create and manipulate streams of events and data. 

This makes developing complex but readable asynchronous code much easier.

Angular 2 adopted RxJS as a dependency, and uses it to manage it's stream of data and flow of actions. 

## Quick Reference

In this tutorial, we will use some of the basic RxJS operators, so let's get a quick reference for those:

* map - use when you want to modify the value of the observable. useful for conversion, adding fields, convert measures, etc.

* filter - use when you want to filter each value the observable get, and continue the flow only with the values that are relevant to your filter.

* startWith - sets the default start value of the `Observable`, before the real stream values.

* flatMap - useful for chaining of Observable objects, just like Promise chaining.

RxJS offers a lot of operators, which can ease your development, you can find more about the operators in [RxJS book, here](http://xgrommx.github.io/rx-book/index.html).

## Meteor-RxJS 

Angular2-Meteor offer users to use `meteor-rxjs` package (which is part of the Angular2-Meteor boilerplate) in order to acheive better results when using Angular 2 along with Meteor.

Angular 2 depends and uses `ngrx` package, and supports `Observable` data sources (for example, using `ngFor` directive).

`meteor-rxjs` package wraps Meteor basic functionality and exposes RxJS interface to your data and methods, and we will use it later for our client side and for declaring our collections.

### See Also

- [RxJS Book](http://xgrommx.github.io/rx-book/index.html)
- [Meteor-RxJS API Documentation](api/meteor-rxjs/latest/MeteorObservable)
- [RxJS API Documentation](http://reactivex.io/rxjs/)
- [meteor-rxjs @ GitHub](https://github.com/Urigo/meteor-rxjs)

[}]: #
[{]: <region> (footer)
[{]: <helper> (nav_step)
| [< Previous Step](step2.md) | [Next Step >](step4.md) |
|:--------------------------------|--------------------------------:|
[}]: #
[}]: #