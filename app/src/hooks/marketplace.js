import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { listMarketplace, sellCryptail } from '../services/marketplace';

export function useMarketplaceList() {
  const wallet = useWallet();
  const [list, setList] = useState([]);

  useEffect(() => {
    async function getList() {
      const _list = await listMarketplace(wallet);
      setList(_list);
    }

    if(wallet.publicKey) {
      getList();
    }
  }, [wallet])

  return { marketplaceCryptails: list };
}


export function useSellCryptail() {
  const wallet = useWallet();

  async function _sell(cryptailAccount, cryptail, price) {
    return sellCryptail(wallet, cryptailAccount, cryptail, price);
  }

  return { sellCryptail: _sell };
}
