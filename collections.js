'use strict';

var _ = require('lodash');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

var host = 'brie.cshl.edu'
  , port = 27017
  , dbName = 'search'
  , dbVersion = '58'
  , rootMongoUrl = 'mongodb://' + host + ':' + port + '/' + dbName + dbVersion
  , databasePromise = Q.ninvoke(MongoClient, "connect", rootMongoUrl);

function Collections(collections) {
  // copy all the properties to this object
  _.assign(this, collections);

  // add mongoCollection function to each.
  _.forOwn(collections, function (collection) {
    collection.mongoCollection = function() {
      return databasePromise.then(function (db) {
        return db.collection(collection.collectionName);
      }).catch(function(err) {
        console.log(err);
      });
    }.bind(this)
  }.bind(this));
}

Collections.prototype.closeMongoDatabase = function () {
  databasePromise.then(function (db) {
    db.close();
  });
};

Collections.prototype.getVersion = function () {
  return dbVersion;
};

Collections.prototype.getMongoConfig = function () {
  return {
    host: host,
    port: port,
    version: dbVersion,
    db: dbName + dbVersion 
  };
};

var collections = new Collections({
  genes: {
    collectionName: 'genes',
    description: 'gramene genes'
  },
  genetrees: {
    collectionName: 'genetree',
    description: 'compara gene trees'
  },
  GO: {
    collectionName: 'GO',
    description: 'gene ontology terms'
  },
  PO: {
    collectionName: 'PO',
    description: 'plant ontology terms'
  },
  taxonomy: {
    collectionName: 'taxonomy',
    description: 'NCBI taxonomy (pruned to cover gramene species)'
  },
  domains: {
    collectionName: 'domains',
    description: 'intepro domains'
  },
  pathways: {
    collectionName: 'pathways',
    description: 'plant reactome pathways and reactions'
  },
  maps: {
    collectionName: 'maps',
    description: 'maps genomes, genetic maps, and physical maps'
  },
  experiments: {
    collectionName: 'experiments',
    description: 'EBI Atlas experiments'
  },
  assays: {
    collectionName: 'assays',
    description: 'EBI Atlas assays'
  },
  expression: {
    collectionName: 'expression',
    description: 'EBI Atlas expression data'
  }
});

module.exports = collections;
