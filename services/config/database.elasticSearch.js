module.exports = (app) => {
    const { Client } = require('@elastic/elasticsearch');
    const elasticSearchClient = new Client({ node: 'http://localhost:9200' });
    app.database.elasticSearch = {
        indexPaper: ({ shcc, maCongTrinh, tenBaiBao }, done) => {
            const id = shcc + '_' + maCongTrinh;
            elasticSearchClient.index({ index: 'papers', id, body: { shcc, maCongTrinh, tenBaiBao } })
                .then(() => done())
                .catch(error => done(error));
        },

        searchPaper: (tenBaiBao, size = 5, done) => {
            elasticSearchClient.search({
                index: 'papers', size,
                body: {
                    query: {
                        match: { tenBaiBao },
                    },
                },
            }).then(({ body }) => {
                let hits = null;
                if (body && body.hits && body.hits.hits) {
                    if (body.hits.hits.length && body.hits.hits[0]._source && body.hits.hits[0]._source.tenBaiBao.toLowerCase() == tenBaiBao.toLowerCase()) {
                        hits = [];
                        body.hits.hits.forEach(item => item._score / body.hits.max_score >= 0.8 && hits.push(item));
                    } else {
                        hits = body.hits.hits;
                    }
                }
                done && done(hits);
            });
        },
    };
};