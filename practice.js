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
db.contacts.createIndex({ 'dob.age': 1 });

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
db.contacts.createIndex({ 'dob.age': 1, gender: 1 });

// find document with age 35 and gender male include performance info
db.contacts.explain('executionStats').find({ 'dob.age': 35, gender: 'male' });  

// find a document with age 35 then find a document with gender male include performance info what do you notice with these separate queries?
db.contacts.explain('executionStats').find({ 'dob.age': 35 });
db.contacts.explain('executionStats').find({ gender: 'male' });

