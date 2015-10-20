'use strict';

var _ = require('lodash');

var host = 'brie.cshl.edu'
  , port = 27017
  , dbVersion = '48';

var collections = {
  genes: {
    host: host,
    port: port,
    dbName: 'search' + dbVersion,
    collectionName: 'genes',
    description: 'gramene genes'
  },
  genetrees: {
    host: host,
    port: port,
    dbName: 'search' + dbVersion,
    collectionName: 'genetree',
    description: 'compara gene trees'
  },
  GO: {
    host: host,
    port: port,
    dbName: 'ontology' + dbVersion,
    collectionName: 'GO',
    description: 'gene ontology terms'
  },
  PO: {
    host: host,
    port: port,
    dbName: 'ontology' + dbVersion,
    collectionName: 'PO',
    description: 'plant ontology terms'
  },
  taxonomy: {
    host: host,
    port: port,
    dbName: 'ontology' + dbVersion,
    collectionName: 'NCBITaxon',
    description: 'NCBI taxonomy (pruned to cover gramene species)'
  },
  domains: {
    host: host,
    port: port,
    dbName: 'ontology' + dbVersion,
    collectionName: 'interpro',
    description: 'intepro domains'
  },
  maps: {
    host: host,
    port: port,
    dbName: 'search' + dbVersion,
    collectionName: 'maps',
    description: 'maps genomes, genetic maps, and physical maps'
  }
};

// setup mongodb collection connections
_.inject(collections, function (databases, collection) {
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
  return databases;
}, {});

module.exports = collections;
