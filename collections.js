'use strict';

var _ = require('lodash');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

// dbName/dbVersion are the DEFAULT db for this build/version (sorghum10b here; a gramene-plants-70
// build sets them to search/70 -> search70). They are NOT hardcoded semantics — just the fallback.
// NOTE: "10b" is a re-tag of the v11-pipeline build over v10 data, done while the real v11 data
// update was in flight; it is intentionally non-numeric so it never collides with sorghum11.
var host = 'localhost'
  , port = 27017
  , dbName = 'sorghum'
  , dbVersion = '10b';
// one connection promise per distinct mongo URL (lazy), so a collection can live in a different db.
var dbPromises = {};

function Collections(collections) {
  // copy all the properties to this object
  _.assign(this, collections);

  // add mongoCollection function to each. A collection without an explicit dbName/dbVersion falls
  // back to this build's default db; a collection MAY override them to live in a shared db that is
  // the same across every site/version build (e.g. genelists -> userData1).
  _.forOwn(collections, function (collection) {
    collection.dbName ||= dbName;
    collection.dbVersion ||= dbVersion;
    collection.mongoCollection = function() {
      var rootMongoUrl = 'mongodb://' + host + ':' + port + '/' + collection.dbName + collection.dbVersion;
      if (!dbPromises[rootMongoUrl]) {
        dbPromises[rootMongoUrl] = Q.ninvoke(MongoClient, "connect", rootMongoUrl);
      }
      return dbPromises[rootMongoUrl].then(function (db) {
        return db.collection(collection.collectionName);
      }).catch(function(err) {
        console.log(err);
      });
    }.bind(this)
  }.bind(this));
}

Collections.prototype.closeMongoDatabase = function () {
  for (const [key, promise] of Object.entries(dbPromises)) {
    promise.then(function (db) {
      db.close();
    });
  }
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
  germplasm: {
    collectionName: 'germplasm',
    description: 'germplasm accessions / stocks'
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
  },
  expression_attributes: {
    collectionName: 'expression_attributes',
    description: 'per-gene expression summary attributes (specificity/enhancement/breadth)'
  },
  genelists: {
    collectionName: 'genelists',
    description: 'saved lists of genes (user data)',
    dbName: 'userData',
    dbVersion: '1'
  },
  savedviews: {
    collectionName: 'savedviews',
    description: 'saved gene-search UI snapshots (filters, views, expanded details)',
    dbName: 'userData',
    dbVersion: '1'
  }
});

module.exports = collections;
