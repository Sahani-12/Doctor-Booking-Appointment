import React from 'react';
import styled from 'styled-components';

const Input = () => {
  return (
    <StyledWrapper>
      <div className="rating">
        <input defaultValue={5} name="rating" id="star5" type="radio" />
        <label htmlFor="star5" />
        <input defaultValue={4} name="rating" id="star4" type="radio" />
        <label htmlFor="star4" />
        <input defaultValue={3} name="rating" id="star3" type="radio" />
        <label htmlFor="star3" />
        <input defaultValue={2} name="rating" id="star2" type="radio" />
        <label htmlFor="star2" />
        <input defaultValue={1} name="rating" id="star1" type="radio" />
        <label htmlFor="star1" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .rating {
    display: flex;
    flex-direction: row-reverse;
    font-size: 0;
  }

  .rating input {
    display: none;
  }

  .rating label {
    font-size: 30px;
    color: rgba(187, 183, 183, 0.726);
    cursor: pointer;
  }

  .rating label:before {
    content: "★"; /* Unicode filled star */
  }

  .rating input:checked ~ label {
    color: #016bf5; /* Change color of selected and previous stars */
  }

  .rating label:hover,
  .rating label:hover ~ label {
    color: #016bf5; /* Hover effect */
  }
`;


export default Input;
