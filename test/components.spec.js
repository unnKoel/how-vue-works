/* eslint-disable no-undef */
import {
  curComponentNodeRef,
  getComponent,
  createComponent,
  registerComponent,
  getDynamicProps,
  getStaticProps,
  // filterPropsByDeclaration,
} from '../src/components';

import {
  useMethods,
  useData,
  useComponents,
  useEvents,
  useRef,
} from '../src/hooks';

test('test getting component', () => {
  const ComponentA = jest.fn();
  const ComponentB = jest.fn();
  const ComponentC = jest.fn();

  const localEnrolledIncomponents = {
    'c-a': ComponentA,
    'c-b': ComponentB,
    'c-c': ComponentC,
  };

  const component = getComponent(localEnrolledIncomponents, 'c-b');
  expect(component).toBe(ComponentB);
});

test('test registering component', () => {
  const ComponentA = jest.fn();
  const ComponentB = jest.fn();
  const ComponentC = jest.fn();

  const localEnrolledIncomponents = {
    'c-a': ComponentA,
    'c-b': ComponentB,
    'c-c': ComponentC,
  };

  const ComponentB1 = jest.fn();
  registerComponent('c-b', ComponentB1);
  const Component = getComponent({}, 'c-b');
  expect(Component).toBe(ComponentB1);

  const Component1 = getComponent(localEnrolledIncomponents, 'c-b');
  expect(Component1).toBe(ComponentB);
});

test('test creating component', () => {
  const component = () => {
    const ref = useRef();

    ref.storeValue = 'Happy beautiful raddit year!';
    const data = useData({
      name: 'addy',
      company: 'epam',
    });

    useMethods({
      onclick: () => {
        data.name = 'yanjunzhou';
      },
    });

    useEvents({
      onParentEvent: () => {},
    });

    useComponents({
      child1: () => {},
      child2: () => {},
    });

    return `
      <div>
        <span>{{name}}</span>
        <a>{{company}}</a>
      <div>
    `;
  };

  expect(curComponentNodeRef).toBe(null);
  const componentNode = createComponent(component);
  expect(curComponentNodeRef).toBe(componentNode);

  expect(componentNode.data).toEqual({
    name: 'addy',
    company: 'epam',
  });
  expect(componentNode.methods.onclick).toBeInstanceOf(Function);
  expect(componentNode.events.onParentEvent).toBeInstanceOf(Function);
  expect(componentNode.components.child1).toBeInstanceOf(Function);
  expect(componentNode.components.child2).toBeInstanceOf(Function);
  expect(componentNode.storeValue).toBe('Happy beautiful raddit year!');
});

test.skip('test concatenation between parent and child component ndoe while creating components', () => {
  const componentParent = () => {
    const data = useData({
      name: 'addy',
      company: 'epam',
    });

    useMethods({
      onclick: () => {
        data.name = 'yanjunzhou';
      },
    });

    return `
      <div>
        <span>{{name}}</span>
        <a>{{company}}</a>
      <div>
    `;
  };

  const componentChild = () => {
    const data = useData({
      book: 'My view on chinglish',
      chapters: ['preface', 'unnecessary words'],
    });

    useMethods({
      onclick: () => {
        data.chatper.push('unnecessary Nouns and Verbs');
      },
    });

    return `
      <div class="root">
        <span>{{book}}</span>
        <div>
          <span v-for="item in chapters">{{item}}</span>
        </div>
      <div>
    `;
  };

  const componentParentNode = createComponent(componentParent);
  expect(curComponentNodeRef).toBe(componentParentNode);

  const componentChildNode = createComponent(componentChild);
  expect(componentParentNode._children[0]).toBe(componentChildNode);
  expect(componentChildNode._parent).toBe(componentParentNode);
  expect(curComponentNodeRef).toBe(componentChildNode);
});

test('test getting dynamic props', () => {
  const attributes = {
    'v-bind:name': 'name',
    'v-bind:my-age': 'age',
  };

  const data = {
    name: 'addy',
    age: 58,
  };

  const dynamicProps = getDynamicProps(attributes, data);
  expect(dynamicProps).toEqual({
    name: 'addy',
    myAge: 58,
  });
});

test('test getting static props', () => {
  const attribute = {
    'v-bind:name': 'name',
    'v-if': 'showed',
    'v-for': 'item in array',
    'v-on:click': 'onClick',
    age: '18',
    'tech-stack': 'vue',
  };

  const staticProps = getStaticProps(attribute);
  expect(staticProps).toEqual({
    age: '18',
    techStack: 'vue',
  });
});

test('test filtering props by declaration', () => {});
