import {
  curComponentNodeRef,
  getComponent,
  createComponent,
  registerComponent,
  getDynamicProps,
  getStaticProps,
  filterPropsByDeclaration,
} from '../src/components';
import observe from '../src/observe';

import { useMethods, useData, useComponents, useEvents, useRef } from '../src/hooks';

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
  expect(componentNode.$on).toBeInstanceOf(Function);
  expect(componentNode.$emit).toBeInstanceOf(Function);
  expect(componentNode.$dispatch).toBeInstanceOf(Function);
  expect(componentNode.$broadcast).toBeInstanceOf(Function);
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

describe('test prop declarations', () => {
  test('declarations as an array of string representing prop name', () => {
    let declaration = ['playground', 'number', 'game'];
    const props = observe({
      playground: 'PG1',
      number: 4,
      game: 'hide and find',
    });

    let filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({
      playground: 'PG1',
      number: 4,
      game: 'hide and find',
    });
    expect(Object.getOwnPropertyDescriptor(filteredProps, 'playground').set).toBeInstanceOf(
      Function
    );

    declaration = ['playground', 'game'];
    filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({
      playground: 'PG1',
      game: 'hide and find',
    });

    declaration = [];
    filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({});
  });

  test('declarations as a object with type option', () => {
    let declaration = {
      playground: {
        type: String,
      },
      number: {
        type: Number,
      },
      game: {
        type: String,
      },
    };
    const props = observe({
      playground: 'PG1',
      number: 4,
      game: 'hide and find',
    });
    let filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({
      playground: 'PG1',
      number: 4,
      game: 'hide and find',
    });

    declaration = {
      playground: {
        type: Number,
      },
      number: {
        type: [Number, String],
      },
    };
    filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({
      number: 4,
    });
    expect(Object.getOwnPropertyDescriptor(filteredProps, 'number').set).toBeInstanceOf(Function);
  });

  test('declarations as a object with validator', () => {
    let declaration = {
      playground: {
        type: String,
      },
      number: {
        type: Number,
        validator: (value) => value > 10,
      },
      game: {
        type: String,
      },
    };
    const props = {
      playground: 'PG1',
      number: 4,
      game: 'hide and find',
    };
    let filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({
      playground: 'PG1',
      game: 'hide and find',
    });
  });

  test('declarations as a object with default value', () => {
    let declaration = {
      playground: {
        type: String,
        default: 'PG2',
      },
      number: {
        type: Number,
        validator: (value) => value > 10,
      },
      game: {
        type: String,
      },
    };
    const props = observe({
      playground: '',
      number: 4,
      game: 'hide and find',
    });
    let filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({
      playground: 'PG2',
      game: 'hide and find',
    });
    expect(Object.getOwnPropertyDescriptor(filteredProps, 'playground').set).toBeInstanceOf(
      Function
    );

    declaration = {
      playground: {
        type: String,
        default: () => 'PG2',
      },
      number: {
        type: Number,
        validator: (value) => value > 10,
      },
      game: {
        type: String,
      },
    };
    filteredProps = filterPropsByDeclaration(props, declaration);
    expect(filteredProps).toEqual({
      playground: 'PG2',
      game: 'hide and find',
    });
    expect(Object.getOwnPropertyDescriptor(filteredProps, 'playground').set).toBeInstanceOf(
      Function
    );
  });
});
