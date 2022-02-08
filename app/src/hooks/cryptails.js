import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { listAllCryptails, createCryptail } from '../services/cryptails';

export function useCryptailsList() {
  const wallet = useWallet();
  const [list, setList] = useState([]);

  useEffect(() => {
    async function getList() {
      const _list = await listAllCryptails(wallet);
      setList(_list);
    }

    if(wallet.publicKey) {
      getList();
    }
  }, [wallet])

  return { cryptails: list };
}

export function useCreateCryptail() {
  const wallet = useWallet();

  async function _create(name, ingridients, method) {
    return createCryptail(wallet, name, ingridients, method);
  }

  return { createCryptail: _create };
}
