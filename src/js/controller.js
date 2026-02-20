import * as model from "./model.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";
import { MODAL_CLOSE_SEC } from "./config.js";

import "core-js/stable"; // Polyfilling all new features, except async/await
import "regenerator-runtime/runtime"; // Polyfilling async/await

const recipeContainer = document.querySelector(".recipe");

// NEW API URL (instead of the one shown in the video)
// https://forkify-api.jonas.io

///////////////////////////////////////
const controlRecipe = async function () {
    try {
        const id = window.location.hash.slice(1);
        if (!id) return console.log("ID: No interaction");
        console.log("ID:", id);

        recipeView.renderSpinner(recipeContainer);

        // 0) Update the results view (active selection)
        resultsView.update(model.getSearchResultsPage());
        bookmarksView.update(model.state.bookmarks);

        // 1) Loading recipe
        await model.loadRecipe(id);
        recipeView.render(model.state.recipe);
    } catch (err) {
        console.log(err);
        recipeView.renderError();
    }
};

const controlSearchResults = async function () {
    try {
        // 1) Get search query
        const query = searchView.getQuery();
        if (!query) return;

        // 2) Load search results
        await model.loadSearchResult(query);

        // 3) Render results
        // console.log("Search results (from the state):", model.state.search.results);
        resultsView.render(model.getSearchResultsPage(1));

        // 4) Render initial pagination
        paginationView.render(model.state.search);
    } catch (err) {
        console.log(err);
    }
};

const controlPagination = function (goToPage) {
    // 1) Render NEW results
    resultsView.render(model.getSearchResultsPage(goToPage));

    // 2) Render NEW  pagination
    paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
    // 1) Update servings
    model.updateServings(newServings);

    // 2) Update NEW servings
    // recipeView.render(model.state.recipe);
    recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
    // 1) Add/remove bookmark
    if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
    else model.deleteBookmark(model.state.recipe.id);

    // 2) Update the bookmark button to filled one (bookmarked)
    recipeView.update(model.state.recipe);

    // 3) Render bookmark list
    bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
    bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
    try {
        // Show loading spinner
        addRecipeView.renderSpinner();

        // Upload recipe data to server
        await model.uploadRecipe(newRecipe);

        // Render recipe
        recipeView.render(model.state.recipe);

        // Render message
        addRecipeView.renderMessage();

        // Change ID in URL
        window.history.pushState(null, "", `#${model.state.recipe.id}`);

        // Render bookmark view
        bookmarksView.render(model.state.bookmarks);

        // Close Upload Window and rebuild the form
        setTimeout(function () {
            addRecipeView.closeWindow();
            setTimeout(() => {
                addRecipeView.render("_");
                // addRecipeView.toggleWindow();
            }, 1000);
            // addRecipeView.render("_");
            // if (!addRecipeView._parentElement.classList.contains("hidden")) return;
            // console.log("hidden?", addRecipeView._parentElement.classList.contains("hidden"));
        }, MODAL_CLOSE_SEC * 1000);
    } catch (err) {
        console.error(`💥${err}`);
        addRecipeView.renderError(err.message);
    }
};

const init = function () {
    bookmarksView.addHandlerRender(controlBookmarks);
    recipeView.addHandlerRender(controlRecipe);
    recipeView.addHandlerUpdateServings(controlServings);
    recipeView.addHandlerAddBookmark(controlAddBookmark);
    searchView.addHandlerSearch(controlSearchResults);
    paginationView.addHandlerPagination(controlPagination);
    addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

window.clearLS = function () {
    localStorage.clear();
};

///////////////////////////////////////
// LECTURES #TAG
// Listening For load and hashchange Events #SUBTAG
/*
1. There are 2 distict events happen when we open a website: #SUB-SUBTAG
a. "DOMContentLoaded" event: DOM tree has been completed, but not other resources (images, iframes, CSS, etc.).
HTML is fully parsed and this including all JS files because they are an HTML tag too; <script> tag
(unless <script async> who isn't counted by the DOMContentLoaded and 
scripts created by document.createElement("script") who by default is an async script too). 

b. "load" event: The page is now fully-completed (including other resources).
*/

//  The MVC Architecture #SUBTAG
/*
1. Why we need architecture? #SUB-SUBTAG
- Structure: It gives structure/organization on our code.
- Maintainability: Because our code is organized. it's easier to maintain.
- Expandability: Also, it makes adding new features in the future easier.
*/

/*
2. 5 Components of Any Architecture:
a. Business Logic: All the code that directly related to the business (solves the business problem).
b. State: All the code used to store app's state. Must be kept sync with UI and vice versa.
Should be "the single source of truth". Devs also used state libraries like Redux.
c. HTTP Library: Responsible for making-receiving an AJAX request. Optional but almost always necessary in real world apps.
d. Application Logic (also called Router because it's mapping user inputs to actions): All code that's directly related to the implementation of the application itself
(for example, handles UI navigations and events).
e. Presentation Logic (UI Layer): All code that's directly related to the UI (visible part) of the app. 
In sync with state component.
*/

/*
3. MVC (Model View Controller) Architecture:
MVC is an architecure that consist of 3 components; Model, View, and Controller,
where all 3 components are standalane (don't know each other), and the Controller acts as a bridge between the other two
(to passing/controlling data flows from the other two). Why? One of the goals of MVS is to separate Business Logic from
Application Logic so the app development becomes easier.

MVC also have all 5 components of architecture in its components:
a. Model (this is all about data, for example, state management and fetching data from API): 
Business Logic, State, and HTTP Library.
b. Controller (orchestrating the data flows in the entire app [the one who imports Modul and View as a module/a function]): 
Application Logic (Router).
c. View (renders the data to the UI): Presentation Logic (UI Layer)
*/

// Developing a DOM Updating Algorithm #SUBTAG
/*
1. Selecting a Portion of Content Using document.createRange() #SUB-SUBTAG

You can select specific content in your HTML using document.createRange() which will return a Range obj.
You have to specifiy the start point and end point of it (using its methods listed nelow) 
(at first, Range obj's start point and end point is the <body>).

This start point is what will be the parent/context for methods like createContextualFragment() to calculate it's algorithm
(for elements that doesn't makes sense to be a parent (like <li> or <tr>),
the createContextualFragment() will take its parentNode as the parent/context of the Range.

Here is Range obj's methods:
a. setStart/setEnd(node, offset): Set the the start/end point:
- If the node is Text node (#text), the offset is the character count.
- If the node is Element node, the offset is the index of child node.
b. selectNode(node): Set the node and its entire content (to the deepest decendant) as the range.
c. deleteContents(): Remove (delete) the range from the DOM.
d. extractContents(): Cuts the range from the DOM and returns it as DocumentFragment obj*.
e. cloneContents(): Copy the range without removing (deleting) it from the DOM.
f. createContextualFragment(htmlString): Convert a string into HTML by taking count of the parent/context of the Range
(differs from element.innerHTML which its context is the element it called upon or 
the DOMParser instance which its context is <body>).

*DocumentFragment obj is a type of Node (so it have access to Node methods like querySlector()) 
containing live DOM obj(s) that's not on the page.
Because of that, you can do things such as:
- Querying (searching) them, like fragment.querySelector(".className").
- Attaching an event listener to them.
- Modifiying them, like styling them.
Just one catch, because they're not part of the page, they don't have a size/position;
so they don't have properties like "offsetWidth". 
*/

/*
2. You can compare two nodes whether they're equal or not using element1.isEqualNode(element2)  #SUB-SUBTAG
(don't confuse it with .isSameNode()).

.isEqualNode() is available in any type of node because it's inherited from the Node interface.

Two nodes are considered equal if they satisfy several criteria:
- Node Type: They must be the same type (e.g., both are Element nodes).
- Local Name: They must share the same tag name (e.g., <div> vs <div>).
- Attributes: They must have the same attributes with the same values (e.g., class="btn").
- Child Nodes: Their children must be equal in number and content, following the same order.
*/

/*
3. nodeValue is a property available in any type of node (because it's defined by the Node interface), #SUB-SUBTAG
used to get the text content of nodes like Text node (for nodes like Element nodes, its value is null).
*/

// Stroing Bookmarks with localStorage #SUBTAG
/*
1. Local Storage is a web storage API exposed (like the DOM API) for us to interact with them with JS. #SUB-SUBTAG
Local Storage store all data as an obj (key-value pairs).

How to use localStrage:
- localStorage.setItem(key, value): Set/store a data.
- localStorage.getItem(key): Get the value of an item.
- localStorage.key(index): Get the key name of a specific virtual index
(the browser made the index for you, used in cases like you want to loop all the items in the Local Storage).
- localStorage.remove(key): Remove an item.
- localStorage.clear(): Clear all data inside the Local Storage (for that website only).

Note:
- The key in Local Storage is case-sensiive (localStorage.user isn't same as localStorage.User).
- The Local Storage only accepts strings. So you have to convert the data using JSON.stringify() and
then when you want to read it again from the Local Storage, you have to use JSON.parse().
- When you access window.localStorage, it will return an obj (Storage Obj) which contains
all the data in the Local Storage (somewhere in the harddrive) and a "length" property,
where all the methods (like setItem(), getItem(), etc.) is in its prototype (StoragePrototype):
window.localStorage --> {key1: <value>, key2: <value>, length: 2}
*/

// Uplaoding a New Recipe - Part 1 #SUBTAG
/*
1. FormData API: A modern API used to envelope/capture data from a <form> elements, #SUB-SUBTAG
though it can also be used to envelope any data):
- new FormData(formElement): Capture data inside the <form>.
- new FormData(): Create a blank digital envelope that you can fill using set(key, value) or append(key, value).

FormData is a key-value pair data-structure and can have a key with multiple values.

new FormData() will return an iterable obj which has built-in methods:
a. set(key, value)*: Add new key-value pair (overwrites existing one).
b. append(key, value)*: Add new value to an existing key.
c. delete(key): Delete a key-value pair.
d. get(key): Return the first value of the key.
e. getAll(key): Return all values of the key.
f. has(key): Return a boolean saying if the key exist.

*Both set() and append() can be used to create new key-value pair in the FormData instance obj.

How to access the data inside FormData instance obj:
Because it's an iterable, you can't use consoloe.log() to see it, instead you need to use spread operator (...) or 
.entries() (a method avaiable in all iterables [iterables that is a collection type, like array, Set, and Map, 
but not String]).
*/

// Uplaoding a New Recipe - Part 2 #SUBTAG
/*
1. HTTP request: Basically just a long string where contents separated by line breaks (\n). #SUB-SUBTAG
This is how it looks:

POST /api/user/save HTTP/1.1
Host: rici-app.com
Content-Type: application/json
User-Agent: Mozilla/5.0
Content-Length: 54
---> Notice here is an empty line, this is used to header and the 
body (so it will not think the body is another header's line).
{
  "name": "Rici",
  "@handle": "rici_dev",
  "age": 25
}

Explanation:
a. The Start Line (The "Action") [POST /api/user/save HTTP/1.1]
- Method [POST]: What are we doing? Sending data.
- Path [/api/user/save]: Where is it going?
- Version [HTTP/1.1]: What language version are we speaking?

b. The Headers (The "Metadata"): Like the info on the outside of an envelope.
- Host: Tells the server which website this belongs to.
- Content-Type: Crucial! This tells the server what type the body content is.
- Content-Length: Tells the server exactly how many characters to expect in the body so 
it knows when the request is finished.

c. The Empty Line (The "Boundary")
This is a mandatory blank line. It acts as the "buffer" between the metadata and the actual data. 
Without this empty line, the server would get confused and think your data is just another header.

d. The Body (The "Payload")
This is your actual data. In this case, we are sending a JavaScript object so it has been turned into a JSON string.
*/

/*
2. HTTP response: #SUB-SUBTAG
This is how it looks:

HTTP/1.1 200 OK
Date: Fri, 13 Feb 2026 11:45:00 GMT
Server: Apache/2.4.41 (Ubuntu)
Content-Type: application/json
Content-Length: 45
Connection: close

{
  "status": "success",
  "id": 9921,
  "message": "User saved"
}

a. The Status Line [HTTP/1.1 200 OK]: The "Verdict"
- Version [HTTP/1.1]: What language version are we speaking?
- Status Code [200]: This is the most famous number in web dev—it means everything went perfectly.
- Reason Phrase [OK]: A human-readable hint about the code.

b. The Response Headers: This is the server giving you info about itself and the data it’s sending back.
- Date: When the response was generated.
- Server: What software the server is running (e.g., Apache, Nginx).
- Content-Type: Just like your request, this tells your browser the content type.

c. The Body: The "Answer"
This is the actual content/data your JS code will process. 
If you requested a website, this would be HTML. If you requested an API (like in this example), it’s JSON.
*/

/*
2. Spread Operator Behaviors: #SUB-SUBTAG
Spread operator can't be used in an "open space" (like !var [logical negation operator] or +var [unary plus operator]),
but must be used inside a "container" (enumerables, iterables, and function arguments)

Spread operator works only in 2 different mechanism:
- Inside an enumerable (obj): Spreading enumberable own properties (Enumerate and Copy). 
- Inside an iterable (arrays and function argument): Spreading using its Iterator protocol (Looping).

Note:
1) Because spreading enumerables and iterables are two different mechanisms,
you can spread an array inside an obj (remember that array stores its elements in index props?),
while you can't spread an obj inside an array (because obj doesn't have an Iterator protocol).

2) When Spread Operator encounters primitive values (non-string value), it will give you nothing (in Enumebrable Spread)
or throw an error (in Iterable Spread). If the value is already an obj, 
the Spread Operator won't convert it to an obj again and simply do its job.

Hree's why:
When encounters primitive values, Spread Operator will wrapping them into an obj 
(using an internal logic called "ToObject" procedure) Which return an obj with:
a. [[Class]]: The Class, like "Number" for numbers (that's why you see [object Number] in the console).
c. [[Prototype]]: Set to the corresponding prototype, like Number.prototye for numbers.
b. [[PrimitiveValue]]: Where the primitive value is stored.

The CATCH: Because that wrapping obj doesn't have any enumerable property and iterator protocol,
the spread operator don't have anything to grab, so:
- In Enumberable Spreading: It gives you nothing.
- In Iterable Spreading: It will throw an error (like TypeError: 10n is not iterable).

For undefined or null, the Spread Operator can't create their wrapping obj 
(because the nature of JS where null/undefined is a signal of no data/identity:
- If they have an obj version, they now have an identity.
- Even if their an obj, their [[PrimaryValue]] store an undefined/null? 
JS creator decides this is confusing and unnecessary.

So for undefined/null:
- In Enumerable Spread: They are ignered, don't do anything.
- In Iterable Spead, they will throw an erro because undefined/null doesn't have iterator protocol 
(they're just primitve value right).
*/

/*
3. NEW MATERIAL 1: Built-In Objects#SUB-SUBTAG
There are 3 different eras where each built-in obj was born:
- The "Forgiving" Era (Arra, Object, Error): These were created in the 90s. 
They were designed to "just work" for non-programmers. If you forgot new, the engine internally fixed it for you. 

- The "Type Casting" Era (Number, String, Boolean):
These serve two masters. With "new" keyword, they create a "Wrapper Object". 
Without "new" keyword, they perform a type conversion.

- The "Strict Class" Era (Set, Map, Promise, class):
When ES6 arrived in 2015, the language designers decided that "fixing" a missing new keyword was a bad habit. 
It creates hidden performance costs and makes the code's intent less clear.

Class is a function, but with a special property [[IsClassContructor]] which enforcing 2 rules on them:
a. "new" keyword is mandatory: To call the function/class, you must use the "new" keyword.
There's no flexibility to call the function/class without the "new" keyword like older built-in obj like String, Array, or Object.
b. Methods defined in the prototype is not enumerable (but the methods defined as own property/field is still enumerable). 

Almost all types of value (Primitive Type and Reference Type) have their built-in obj.
--- True Converters:
a. String: 
- new String(): Constructor, create an [object String] obj.
- String(): Converter.

b. Number:
- new Number(): Constructor, create an [object Number] obj.
- Number(): Converter.

c. Boolean:
- new Booleans():  Constructor, create an [object Boolean] obj.
- Boolean(): Converter.

--- Strict Converters (only convert certain types like Number or String, throw error when accepting arguments like arrays):
d. BigInt:
- No new BigInt() for some reason (force developers to stick on the primitve value).
- BigInt(): Converter.

--- Unique Factory:
e. Symbol:
- No new Symbol() same reason like BigInt.
- Symbol(label): Create a symbol with the specified label.

--- Smart Wrapper
f. Object:
- new Object(value): Constructor, create new obj based on the type of value (like [object Number] for numbers).
- Object(): Converter, but basically do the same as "new Object()".

--- Constructor
g. Array:
- new Array(length): Constructor. Create a new array of the specified length.
- new Array(non-number) or new Array(item1, item2, item3 [more than 1 arguments]): Create the new Array with that item(s).
- Array(): Do the same as above.

h. Function:
- new Function(body [string]): If 1 argument is passed, it creates a new function with that string as its logic/body.
- new Function(param1, param2, body [string]): If more thaon 1 argument is passed, 
it creates a new function with the last argument as its bdy and the other(s) as the parameter(s). 
- Function(): Do the same.

i. Set:
- new Set(iterable): Constructor, create a Set.
- No Set() for some reason*.

j. Map:
- new Map(arrayOfEntries): Contructor, create a Map.
- No Map() for some reason*.

h. Promise:

*Map, Set, and Promise are modern bu (ES6+) so they don't have Map()/Set() variation like Number, String, or Boolean does.
*/

/*
4. NEW MATERIAL 2: Generator Function #SUB-SUBTAG
Generator function is another type of function that can be paused.
You use "yield" keyword to pause the function (its state and variables will be saved) and return a value,
and when you re-call the function again, you can pass another value () the "yield" keyword will retrive back to the function.

*/

/*
5. NEW MATERIAL 3: Symbol #SUB-SUBTAG
Symbol is a primitive value use as an unique key with a label attached to it 
(only 1 symbol with that label in the whole app).

But 

*/

/*
6. NEW MATERIAL 4: window.history.pushState() and Browser-Tab's Session History Stack #SUB-SUBTAG
Session History Stack is a stack* used to track user's trail on that specific browser tab.
Each  browser tab has its own Session History Stack, so even if you open the same URL on another tab, 
that new tab gets its own newly-fresh Session History Stack. 
Session History Stack is session-based, means that it will be terminated when the tab is closed/killed.

In the eyes of browser, when you are clicking the "Back"/"Next" arrow button, 
you're basically "moving the pointer" through the stack of states (History Entries).

History Entry is a bundle of:
- URL: The URL (in the search bar) for that specific History Entry.
- State obj (a freeze obj): What you can save for that History Entry.
- Document State: Internal browser data (like form values or scroll position).

Whenever you click the "Back"/"Next" arrow button,
the browser will swiping through the Session History Stack and 
"popping" the current History Session to the new active one 
(emits "popState" event and overwrite the window.history.state to the active state obj).

Usually when the browser navigates to another page, a new History Entry will be added.
But you can add one manually by using:
window.history.pushState(stateObj, pageTitle*, url)

You can also replace the current state obj with a new state obj with:
window.history.replaceState(stateObj, pageTitle*, url).

*pageTitle is used by older browser to change the textContent of <title>.
Most modern browsers now will ignore this, but for compatibility, you just put an empty string "".

Note:
1. Both window.history.pushState() amd window.history.replaceState() will not emit "hashchange" and "popState" event,
because your'rer calling those methods (not waiting something, but instead you run it synchronously).

2. Once created, a History Entry can't be deleted. This is for security reason 
(malicious websites could trap the user by deleting the "Back" button destination).
What you can delete is the state obj:
window.history.replaceState(null, "", window.location.href)
*/
