'use strict';

var _ = require('lodash');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

var host = 'squam'
  , port = 27017
  , dbName = 'sorghum'
  , dbVersion = '10';
// One connection promise per distinct mongo URL (lazy), so a collection MAY override dbName/
// dbVersion to live in a db shared across every site/version build (genelists + savedviews ->
// userData1). Previously every collection collapsed onto the default db (sorghum10), so lists
// saved on this site were invisible to other releases (which read userData1).
var dbPromises = {};

function Collections(collections) {
  // copy all the properties to this object
  _.assign(this, collections);

  // add mongoCollection function to each. A collection without an explicit dbName/dbVersion falls
  // back to this build's default db.
  _.forOwn(collections, function (collection) {
    collection.dbName = collection.dbName || dbName;
    collection.dbVersion = collection.dbVersion || dbVersion;
    collection.mongoCollection = function() {
      var url = 'mongodb://' + host + ':' + port + '/' + collection.dbName + collection.dbVersion;
      if (!dbPromises[url]) {
        dbPromises[url] = Q.ninvoke(MongoClient, "connect", url);
      }
      return dbPromises[url].then(function (db) {
        return db.collection(collection.collectionName);
      }).catch(function(err) {
        console.log(err);
      });
    }.bind(this)
  }.bind(this));
}

Collections.prototype.closeMongoDatabase = function () {
  Object.keys(dbPromises).forEach(function (url) {
    dbPromises[url].then(function (db) { db.close(); });
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
  genelists: {
    collectionName: 'genelists',
    description: 'saved lists of genes',
    dbName: 'userData',
    dbVersion: '1'
  },
  savedviews: {
    collectionName: 'savedviews',
    description: 'saved gene-search UI snapshots (filters, views, expanded details)',
    dbName: 'userData',
    dbVersion: '1'
  },
  genes: {
    collectionName: 'genes',
    description: 'gramene genes'
  },
  genetrees: {
    collectionName: 'genetree',
    description: 'compara gene trees'
  },
  germplasm: {
    collectionName: 'germplasm',
    description: 'germplasm'
  },
  GO: {
    collectionName: 'GO',
    description: 'gene ontology terms'
  },
  PO: {
    collectionName: 'PO',
    description: 'plant ontology terms'
  },
  TO: {
    collectionName: 'TO',
    description: 'trait ontology terms'
  },
  qtls: {
    collectionName: 'qtls',
    description: 'qtls'
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
