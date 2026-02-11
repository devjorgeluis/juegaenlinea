import { createRoot } from 'react-dom/client'
import AppContextProvider from './AppContext.jsx'

import './css/default.css'
import './css/swiper.css'
import './css/header.css'
import './css/bonus.css'
import './css/rollover-progress.css'
import './css/menu.css'
import './css/footer.css'
import './css/footer-payment-methods.css'
import './css/loading.css'
import './css/float-search.css'
import './css/deposits.css'
import './css/withdrawals.css'
import './css/login.css'
import './css/block.css'
import './css/promos.css'
import './css/completeProfile.css'
import './css/iframe.css'
import './css/emptyWithHeader.css'


import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <AppContextProvider>
      <App className="normal-mode app-mode"/>
    </AppContextProvider>
  // </StrictMode>
)