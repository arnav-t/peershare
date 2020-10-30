const path = require('path');

module.exports = {
    entry: './webapp.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test:/\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    'targets': {
                                        'node': 'current'
                                    }
                                }
                            ],
                            '@babel/react'
                        ]
                    }
                }
            },
            {
                test:/\.css$/,
                use:['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    watchOptions: {
        poll: true,
        ignored: ['node_modules/**']
    }
};