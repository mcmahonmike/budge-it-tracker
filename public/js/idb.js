//variable to hold db connection
let db;

//connection to IndexedDB database
const request = indexedDB.open('budge-it-tracker', 1);

request.onupgradeneeded = function(event) {
    // save a reference to the database 
    const db = event.target.result;
    // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts 
    db.createObjectStore('new_data', { autoIncrement: true });
  };

// upon a successful 
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
}

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
  };

  // This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_data'], 'readwrite');
  
    // access the object store for `new_pizza`
    const dataObjectStore = transaction.objectStore('new_data');
  
    // add record to your store with add method
    dataObjectStore.add(record);
  }

function uploadTransaction(){
   // open a transaction on your db
   const transaction = db.transaction(['new_data'], 'readwrite');

   // access your object store
   const dataObjectStore = transaction.objectStore('new_data');
 
   // get all records from store and set to a variable
   const getAll = dataObjectStore.getAll();
   // upon a successful .getAll() execution, run this function
getAll.onsuccess = function() {
  // if there was data in indexedDb's store, let's send it to the api server
  if (getAll.result.length > 0) {
    fetch('/api/transaction', {
      method: 'POST',
      body: JSON.stringify(getAll.result),
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open one more transaction
        const transaction = db.transaction(['new_data'], 'readwrite');
        // access the new_pizza object store
        const dataObjectStore = transaction.objectStore('new_data');
        // clear all items in your store
        dataObjectStore.clear();

        alert('All saved transaction data has been submitted!');
      })
      .catch(err => {
        console.log(err);
      });
  }
};
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);