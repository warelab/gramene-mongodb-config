'use strict';

var _ = require('lodash');
var Q = require('q');
var MongoClient = require('mongodb').MongoClient;

var host = 'localhost'
  , port = 27017
  , dbName = 'maize'
  , dbVersion = '6';
var dbPromises = {};
function Collections(collections) {
  // copy all the properties to this object
  _.assign(this, collections);

  // add mongoCollection function to each.
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
  for(const [key, promise] of Object.entries(dbPromises)) {
    promise.then(function(db) {
      db.close();
    })
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
  homologs: {
    collectionName: 'homologs',
    description: 'per-gene compara homologs: {_id: gene stable_id, homologous_genes: {kind: [stable_id]}}'
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
  germplasm: {
    collectionName: 'germplasm',
    // NO dbName/dbVersion override. main_v70 added `dbName:'germplasm', dbVersion:'1'`,
    // pointing every consumer at a database `germplasm1` that does not exist on this host --
    // so /germplasm answered [] while 10,797 docs sat in maize6.germplasm, where
    // stages/22_germplasm.sh puts them. germplasm is per-site data and belongs in the site db,
    // as maize v5, sorghum v11 and oryza v9 all have it. release70 and grapevine v5 carry the
    // same broken override and simply have no germplasm data to expose it.
    description: 'germplasm metadata'
  }
});

module.exports = collections;
