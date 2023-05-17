/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */

import render from '../src/render';
import { useComponents } from '../src/hooks';

test('create component tree in simple case', () => {
  const componentB = () => {
    return `
      <div class="search-box">
        <h2>hi slot</h2>
        <slot></slot>
      </div>`;
  };

  const componentA = () => {
    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <component-b>
          <p>let's go to slot world</p>
        </component-b>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  console.log(document.body.innerHTML);
});
