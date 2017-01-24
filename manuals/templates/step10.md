In this step, we will implement a mechanism similar to pagination in order to load only part of the messages, and lazy-load them when needed.

Later, we will add a new feature for searching contacts using Ionic 2 UI features and Meteor subscription params.

So let's start!

## Pagination

Let's start by limiting our messages subscription, we will define that each page contains 30 messages only, and when scrolling back in the messages view, we will load more according to the times you reach to the top of the messages.

So add the limit with the basic calculation:

{{{diff_step 10.1}}}

Now, let's add a counter, and we will increase this number each time the `messages` subscription is created again (we will implement the subscription re-creation soon):

{{{diff_step 10.2}}}

Now, our client need to know how much total older message are there, so let's add a method for checking the current amount of messages:

{{{diff_step 10.3}}}

And now use it in the client side, we need to subscribe to the scroller events, to know where the scroll reached to the top of the page, then we need to decide if we need to more messages - so we are doing it only when the scroll it at the top of the scroll and then we are not loading messages, to make sure that we don't execute the same subscription twice:

And finally, we want to execute the subscription again, which will increase our counter and then fetch more messages from the server

{{{diff_step 10.4}}}

## Filter

So now we want to implement the contacts search bar, in our new chat modal.

Let's start by implementing the logic using RxJS - we will use `BehaviorSubject` which is similar to `Observable`, but have an initial value and allows us to fetch the last value anytime, without creating a subscription and use `subscribe`.

Our search pattern from the search bar input will be stored inside the `BehaviorSubject`, that way to can observe it for changes (just like any other `Observable`), but also fetch it's value anytime (to create the subscription).

{{{diff_step 10.5}}}

> `debounce` operator uses to "calm things down" when dealing with keyboard and mouse events - what means that we will only handle one change value event in a time span of 1000ms.

So in each time our pattern changes, we recreate the Meteor subscription, and use the new value as parameter for the subscription.

Now let's add the template of the search bar, and bind events and some conditional UI to display the search bar with a cool appearance:

{{{diff_step 10.6}}}

We also need to modify our server side subscription, and use the search pattern provided by the client side:

{{{diff_step 10.7}}}

> The idea is to display all contacts, and when searching we want to do the actual filtering, that's why the default MongoDB selector is just `{}`, and only when a pattern is provided, we modify it and do a search.
