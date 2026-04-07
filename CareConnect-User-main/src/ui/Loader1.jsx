import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <StyledWrapper>
      <div className="spinner">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`spinner-blade blade-${i + 1}`} />
        ))}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  .spinner {
    font-size: 15px; /* Smaller size */
    position: relative;
    width: 1em;
    height: 1em;
  }

  .spinner .spinner-blade {
    position: absolute;
    left: 0.45em;
    bottom: 0;
    width: 0.07em;
    height: 0.25em;
    border-radius: 0.05em;
    background-color: transparent;
    transform-origin: center -0.2em;
    animation: spinner-fade 1s infinite linear;
  }

  ${[...Array(12)]
    .map(
      (_, i) => `
    .spinner .blade-${i + 1} {
      transform: rotate(${i * 30}deg);
      animation-delay: ${i * 0.083}s;
    }
  `
    )
    .join("")}

  @keyframes spinner-fade {
    0% { background-color: #ffffff; }
    100% { background-color: transparent; }
  }
`;

export default Loader;
