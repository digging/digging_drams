#!/bin/sh

#scp * mcd:/home/jahn/apache-solr-4.0.0/example/solr/test_core/conf/velocity
rsync -avz . mcd:/home/jahn/apache-solr-4.0.0/example/solr/test_core/conf/velocity
