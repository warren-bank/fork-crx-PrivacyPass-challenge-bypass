import '@popup/styles/body.scss';

import { App } from '@popup/components/App';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { store } from './store';

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root'),
);

store.dispatch({ type: 'OBTAIN_STATE' });
