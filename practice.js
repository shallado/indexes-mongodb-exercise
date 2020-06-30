// import starting data files
// mongoimport persons.json -d test-db -c contacts --jsonArray --drop

// ------------------------- Adding a Single Field Index -----------------------
// find documents where age is greater than 60 and use a tool that will give info on performance of the query 
db.contacts.explain('executionStats').find({
  'dob.age': {
    $gt: 60
  }
});

// repeat the query above but just give me a general overview of the query
db.contacts.explain().find({
  'dob.age': {
    $gt: 60
  }
});

// create an index for age field and have the index be ordered in ascending order
// make sure to get the performance of the query before adding an index to compare performance
db.contacts.createIndex({
  'dob.age': 1
});

// compare performance with query that was done without index with the one with and index
// compare fields
  // executionStages.stage = check to see which was the winning plan
  // docsExamined
  // executionTimeMillis
  // look at totalDocExamined with nReturned
db.contacts.explain('executionStats').find({
  'dob.age': {
    $gt: 60
  }
});

// remove an index
db.contacts.dropIndex({
  'dob.age': 1
});

// ------------------------- Creating Compound Indexes ---------------------
// create a compound index with field age and gender in both ascending order
db.contacts.createIndex({
  'dob.age': 1,
  gender: 1
});

// find document with age 35 and gender male include performance info
db.contacts.explain('executionStats').find({
  'dob.age': 35,
  gender: 'male'
});

// find a document with age 35 then find a document with gender male include performance info what do you notice with these separate queries?
db.contacts.explain('executionStats').find({
  'dob.age': 35
});
db.contacts.explain('executionStats').find({
  gender: 'male'
});

// ------------------------- Using Indexes for Sorting ---------------------
// find documents with age field 35 and sort by gender in ascending order
db.contacts.explain('executionStats').find({
  'dob.age': 35
}).sort({
  gender: 1
});

// ------------------------- Understanding Default Index ---------------------
// shows all indexes we do have 
db.contacts.getIndexes();

// ------------------------- Configuring Index -----------------------
// create an index fo email field that is ascending order and make sure there are not duplicate emails in this index
db.contacts.createIndex({ email: 1 }, { unique: true });

// ------------------------- Understanding Partial Filters ---------------------
// create an index for age field in ascending order and only for documents which have the age field that have the gender field as male
db.contacts.createIndex({ 
  'dob.age': 1 
}, {
  partialFilterExpression: {
    gender: 'male'
  }
});

// ------------------------- Applying the Partial Index -----------------------
// users collection

// add two documents with name fields Max, Manu and email field max@test.com, manu@test.com
db.users.insertMany([{
  name: 'Max',
  email: 'max@test.com'
}, {
  name: 'Manu',
  email: 'manu@test.com'
}]);

// create an index for the email field in ascending order also prevent duplicate email values from being added
db.users.createIndex({ 
  email: 1 
}, { 
  unique: true
});

// add a document with name field Anna
db.users.insertOne({
  name: 'Anna'
});

// add a document with name field Michael  
db.users.insertOne({
  name: 'Michael'
});

// What do you observe when adding the document above and how can you fix the issue where you still can have duplicate values but it won't error when values for a index field is null
db.users.dropIndex({ email: 1 });
db.users.createIndex({ 
  email: 1 
}, {
  unique: 1,
  partialFilterExpression: {
    email: {
      $exists: true
    }
  }
});

// ------------------------- Understanding the Time-To-Live (TTL) Index --------
// sessions collection

// add one document with field data with any string, createdAt with current date?
db.sessions.insertOne({
  data: 'hello world',
  createdAt: new Date()
});

// index the field createdAt in ascending order and also have all documents that have the indexed field createdAt be removed from database after 10 seconds?
db.sessions.createIndex({
  createdAt: 1
}, {
  expireAfterSeconds: 10
});


// add another document
db.sessions.insertOne({
  data: 'my name is web developer',
  createdAt: new Date()
});

// does this method work for any fields or specific field and what do you observe?
// whats a good use case for using this method

// ------------------------- Understanding text indexes -----------
// products collection

// add these two documents
// {
//   title: 'A book',
//   description: 'This is an awesome book about a young artist!'
// }
// {
//   title: 'Red T-Shirt',
//   description: "This T-Shirt is read and it's pretty awesome!"
// }
db.products.insertMany([{
  title: 'A book',
  description: 'This is an awesome book about a young artist!'
}, {
  title: 'Red T-Shirt',
  description: "This T-Shirt is read and it's pretty awesome!"
}]);

// create a text index for description field
db.products.createIndex({ description: 'text' });

// find documents that have description contain 'awesome'
db.products.find({
  $text: {
    $search: 'awesome'
  }
}).pretty();

// find documents that have description containing either 'red' or 'book'
db.products.find({
  $text: {
    $search: 'red book'
  }
}).pretty();

// find documents that have description containing the phrase red book
db.products.find({
  $text: {
    $search: "\"red book\""
  }
}).pretty();

// ------------------------- Text Indexes & Sorting -----------
// products collection

// check to see how mongo is sorting the data
db.products.find({
  $text: {
    $search: 'awesome t-shirt'
  }
}, {
  score: {
    $meta: 'textScore'
  }
}).pretty();

// find a description field containing either 'awesome' or 't-shirt'
// make sure you sort with best results
db.products.find({
  $text: {
    $search: 'awesome t-shirt'
  }
}, {
  score: {
    $meta: 'textScore'
  }
}).sort({
  score: {
    $meta: 'textScore'
  }
}).pretty()

// ------------------------- Creating Combined Text Indexes -----------
// products collection

// how many text indexes are you allowed to have?

// create a combined text index with the fields title and description
db.products.createIndex({
  title: 'text',
  description: 'text'
});

// add a new document 
// {
//   title: 'A Ship',
//   description: 'Floats perfectly'
// }

// find a if any documents contain the word in the title or description field

// ------------------------- Using Text Indexes to Exclude Words -----------
// products collection

// find products that have title or description field that contains the word awesome but not t-shirt

db.products.find({ 
  $text: {
    $search: 'awesome -t-shirt'
  } 
}).pretty();

// --------------------- Setting the Default Language & Using Weights ---------