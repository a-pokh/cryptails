import React  from 'react';
import styled from 'styled-components';
import { useForm } from "react-hook-form";

import { useCreateCryptail } from '../hooks/cryptails';

function Field({ name, label, register, errors }) {
  return (
    <FieldWrapper>
      <label>{label}
        <br />
        <input {...register(name, { required: true })} />
      </label>
      <br />
      {errors[name] && <span>This field is required</span>}
    </FieldWrapper>
  )
}

export function Create() {
  const { register, reset, handleSubmit, formState: { errors } } = useForm();
  const { createCryptail } = useCreateCryptail();

  async function onSubmit({ name, ingridients, method }) {
    await createCryptail(name, ingridients, method);
    reset();
  }

  return (
    <FormWrapper onSubmit={handleSubmit(onSubmit)}>
      <h3>Create new cryptail</h3>
      <Field name='name' label='Name' register={register} errors={errors} />
      <Field name='ingridients' label='Ingridients' register={register} errors={errors} />
      <Field name='method' label='Method' register={register} errors={errors} />
      <button type="submit">Create</button>
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

const FieldWrapper = styled.div`
  width: 100%;
  padding: 8px 0;

  input {
    width: 100%;
    height: 38px;
    padding: 4px 6px;
    font-size: 18px;
  }

  span {
    color: red;
  }
`;
