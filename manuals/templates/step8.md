Our next step is about adding the ability to create new chats.

So far we had the chats list and the users feature, we just need to connect them.

Let's start by declaring how our User object is defined, so it will be easier to connect it later to our users list:

{{{diff_step 8.1}}}

Meteor comes with a built-in users collection, called `Meteor.users`, and we need to wrap it in order to use it as `ObservableCollection`:

{{{diff_step 8.2}}}

And let's add our new wrapped collection to the index file:

{{{diff_step 8.3}}}

## Chats Creation

We will open the new chat view using Ionic's modal dialog. 

The dialog is gonna pop up from the chats view once we click on the icon at the top right corner of the view. Let's implement the handler in the chats component first:

{{{diff_step 8.4}}}

{{{diff_step 8.5}}}

{{{diff_step 8.6}}}

The dialog should contain a list of all the users whose chat does not exist yet. Once we click on one of these users we should be demoted to the chats view with the new chat we've just created.

And let's bind the event to the view, implement the method:

{{{diff_step 8.7}}}

And bind it to the button:

{{{diff_step 8.8}}}

And import it into our `NgModule`:

{{{diff_step 8.9}}}

Since we wanna insert a new chat we need to create the corresponding method in the `methods.ts` file:

{{{diff_step 8.10}}}

As you can see, a chat is inserted with an additional `memberIds` field. 

Let's update the chat model accordingly:

{{{diff_step 8.11}}}

Thanks to our new-chat dialog, we can create chats dynamically with no need in initial fabrication. 

Let's replace the chats fabrication with users fabrication in the Meteor server:

{{{diff_step 8.12}}}

Since we've changed the data fabrication method, the chat's title and picture are not hardcoded anymore, therefore they should be calculated in the components themselves. Let's calculate those fields in the chats component:

{{{diff_step 8.13}}}

Now we want our changes to take effect. We will reset the database so next time we run our Meteor server the users will be fabricated. To reset the database, first make sure the Meteor server is stopped and then type the following command:

    $ meteor reset

And once we start our server again it should go through the initialization method and fabricate the users.

