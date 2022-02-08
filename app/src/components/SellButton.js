import React  from 'react';
import styled from 'styled-components'; 
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useForm } from "react-hook-form";

import { useSellCryptail } from '../hooks/marketplace';

export function SellButton({ cryptail, cryptailAccount }) {
  return (
    <Popup modal trigger={<button>Sell</button>} position="right center">
      <Sell cryptail={cryptail} cryptailAccount={cryptailAccount} />
    </Popup>
  );
}

function Sell({ cryptail, cryptailAccount }) {
  const { register, reset, handleSubmit, formState: { errors } } = useForm();
  const { sellCryptail } = useSellCryptail();

  async function onSubmit({ price }) {
    await sellCryptail(cryptailAccount, cryptail, price);
    reset();
  }

  return (
    <FormWrapper onSubmit={handleSubmit(onSubmit)}>
      <h3>Sell cryptail on marketplace</h3>
      <label>
        Please specify the price
        <br />
        <input type='number' {...register('price', { required: true })} />
      </label>
      <br />
      {errors.price && <span>This field is required</span>}
      <button type="submit">Sell</button>
    </FormWrapper>
  );
}


const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);

  button {
    width: 100%;
    height: 38px;
    font-size: 18px;
  }
`;

