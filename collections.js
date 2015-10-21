'use strict';

var _ = require('lodash');

var host = 'brie.cshl.edu'
  , port = 27017
  , dbName = 'search'
  , dbVersion = '48';

var collections = {
  genes: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'genes',
    description: 'gramene genes'
  },
  genetrees: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'genetree',
    description: 'compara gene trees'
  },
  GO: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'GO',
    description: 'gene ontology terms'
  },
  PO: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'PO',
    description: 'plant ontology terms'
  },
  taxonomy: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'NCBITaxon',
    description: 'NCBI taxonomy (pruned to cover gramene species)'
  },
  domains: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'domains',
    description: 'intepro domains'
  },
  pathways: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'pathways',
    description: 'plant reactome pathways and reactions'
  },
  maps: {
    host: host,
    port: port,
    dbName: dbName + dbVersion,
    collectionName: 'maps',
    description: 'maps genomes, genetic maps, and physical maps'
  }
};

var databases = {};

// setup mongodb collection connections
_.forEach(collections, function (collection) {
  var MongoClient = require('mongodb').MongoClient;
  var Q = require('q');

  collection.mongoCollection = function () {
    var database = databases[collection.dbName];
    if (!database) {
      var url = 'mongodb://' + collection.host + ':' + collection.port + '/' + collection.dbName;
      database = databases[collection.dbName] = Q.ninvoke(MongoClient, "connect", url);
    }

    return database.then(function (db) {
      return db.collection(collection.collectionName);
    });
  };
});

Object.getPrototypeOf(collections).closeDatabases = function() {
  _.forEach(databases, function(db) {
    db.close();
  });

  databases = {};
};

module.exports = collections;
