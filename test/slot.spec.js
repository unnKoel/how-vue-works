/**
 * @jest-environment jsdom
 */

/* eslint-disable no-undef */

import render, { componentStack } from '../src/render';
import { useComponents, useData } from '../src/hooks';

beforeEach(() => {
  document.body.innerHTML = '';
  while (!componentStack.isEmpty()) {
    componentStack.pop();
  }
});

test('simple slot', () => {
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
  expect(document.body.innerHTML).toBe(
    `
    <div id="root">
      <div class="search-box">
        <h2>hi slot</h2>
        <p>let's go to slot world</p>
      </div>
    </div>    
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
});

test('slot template with a few elements', () => {
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
          <p>ready go</p>
          <p>set off</p>
        </component-b>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
    <div id="root">
      <div class="search-box">
        <h2>hi slot</h2>
        <p>let's go to slot world</p>
        <p>ready go</p>
        <p>set off</p>
      </div>
    </div>    
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
});

test('named slot', () => {
  const componentB = () => {
    return `
      <div class="search-box">
        <slot name="s1"></slot>
        <h2>hi slot</h2>
        <slot></slot>
        <slot name="s2"></slot>
      </div>`;
  };

  const componentA = () => {
    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <component-b>
          <p slot="s1">let's go to slot world</p>
          <p slot="s2">ready go</p>
          <p>set off</p>
        </component-b>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
    <div id="root">
      <div class="search-box">
        <p slot="s1">let's go to slot world</p>
        <h2>hi slot</h2>
        <p>set off</p>
        <p slot="s2">ready go</p>
      </div>
    </div>    
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
});

test('slot with directives', () => {
  const componentB = () => {
    return `
      <div class="search-box">
        <slot name="s1"></slot>
        <h2>hi slot</h2>
        <slot></slot>
        <slot name="s2"></slot>
      </div>`;
  };

  const componentA = () => {
    useData({
      array: [
        { title: 'Navigate to Google', site: 'Google' },
        { title: 'Navigate to Microsoft', site: 'Microsoft' },
        { title: 'Navigate to Apple', site: 'Apple' },
      ],
    });

    useComponents({
      'component-b': componentB,
    });

    return `
      <div id="root">
        <component-b>
          <p slot="s1">let's go to slot world</p>
          <div slot="s2">
            <p v-for="item in array" track-by="site">
              <a href="www.google.com" v-bind:title="item.title">Navigate to {{item.site}}</a>
            </p>
          </div>
          <p>set off</p>
        </component-b>
      </div>
    `;
  };

  render(componentA, {}, document.body);
  expect(document.body.innerHTML).toBe(
    `
    <div id="root">
      <div class="search-box">
        <p slot="s1">let's go to slot world</p>
        <h2>hi slot</h2>
        <p>set off</p>
        <div slot="s2">
          <p><a href="www.google.com" title="Navigate to Google">Navigate to Google</a></p>
          <p><a href="www.google.com" title="Navigate to Microsoft">Navigate to Microsoft</a></p>
          <p><a href="www.google.com" title="Navigate to Apple">Navigate to Apple</a></p>
        </div>
      </div>
    </div>    
  `
      .replace(/>\s+|\s+</g, (m) => m.trim())
      .replace(/\n/g, '')
  );
});
