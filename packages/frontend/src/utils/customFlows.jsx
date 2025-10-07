import { isValidUrl } from '@/utils/helper';
import { NumberInput, Select, Textarea, TextInput } from '@mantine/core';

export const STEP_TYPES = [
  {
    value: 'goto', label: 'Go to URL', type: 'action',
    description: 'Navigate to a specific URL on your website.',
    Inputs: [({ ...params }) => <TextInput label="URL" placeholder="https://example.com/page" {...params} />],
    getDescription: (step) => `${step?.values[0] || ''}`,
    validate: (values) => isValidUrl(values[0]),
  },
  {
    value: 'click', label: 'Click Element', type: 'action',
    description: 'Simulate a click on a specific element.',
    Inputs: [({ ...params }) => <TextInput label="CSS Selector" placeholder="#button, .class, button" {...params} />],
    getDescription: (step) => `${step?.values[0] || ''}`,
    validate: (values) => !!values[0],
  },
  {
    value: 'fill', label: 'Fill Input', type: 'action',
    description: 'Fill out a form input with specified text.',
    Inputs: [
      ({ ...params }) => <TextInput mb="sm" label="CSS Selector" placeholder="#input, .class, input" {...params} />,
      ({ ...params }) => <TextInput label="Value" placeholder="Text to enter" {...params} />
    ],
    getDescription: (step) => `${step?.values[0] || ''} ${step?.values[1] ? `with "${step?.values[1]}"` : ''}`,
    validate: (values) => !!values[0] && !!values[1],
  },
  {
    value: 'type', label: 'Enter text', type: 'action',
    description: 'Type text into a focused input field.',
    Inputs: [({ ...params }) => <Textarea label="Text" placeholder="Text to enter" {...params} />],
    getDescription: (step) => step?.values[0] ? `"${step?.values[0]}"` : '',
    validate: (values) => !!values[0],
  },
  {
    value: 'waitForSelector', label: 'Wait for Selector', type: 'action',
    description: 'Wait until a specific element appears on the page.',
    Inputs: [({ ...params }) => <TextInput label="CSS Selector" placeholder="#element, .class, tag" {...params} />],
    getDescription: (step) => `${step?.values[0] || ''}`,
    validate: (values) => !!values[0],
  },
  {
    value: 'waitForTimeout', label: 'Wait for Timeout', type: 'action',
    description: 'Pause the flow for a specified duration (in milliseconds).',
    Inputs: [({ ...params }) => <NumberInput label="Timeout (ms)" placeholder="1-10000" max={10000} min={1} {...params} />],
    getDescription: (step) => step?.values[0] ? `${step?.values[0]} ms` : '',
    validate: (values) => !!values[0] && !isNaN(values[0]) && values[0] > 0,
  },
  {
    value: 'url', label: 'Assert URL', type: 'assertion',
    description: 'Verify that the current URL matches the expected URL.',
    Inputs: [({ ...params }) => <TextInput label="Expected URL" placeholder="https://example.com/" {...params} />],
    getDescription: (step) => `${step?.values[0] || ''}`,
    validate: (values) => isValidUrl(values[0]),
  },
  {
    value: 'expect', label: 'Check for Element', type: 'assertion',
    description: 'Assert the presence or visibility of a specific element on the page.',
    Inputs: [
      ({ ...params }) => <TextInput mb="sm" label="CSS Selector" placeholder="#element, .class, tag" {...params} />,
      ({ ...params }) => <TextInput label="Expected Text" placeholder="Text that should be present" {...params} />,
      () => <Divider mt="xs" label="or" labelPosition="center" />,
      ({ ...params }) => <Select
        label="Visible"
        data={[
          { value: 'true', label: 'True' },
          { value: 'false', label: 'False' },
        ]}
        placeholder="Should the element be visible?"
        {...params}
      />,
    ],
    getDescription: (step) => {
      let desc = step?.values[0] || '';
      if (step?.values[1]) {
        desc += ` with text "${step.values[1]}"`;
      }
      if (step?.values[3]) {
        desc += ` (visible: ${step.values[3]})`;
      }
      return desc;
    },
    validate: (values) => !!values[0] && (values[1] || values[3]),
  },
  {
    value: 'evaluate', label: 'Evaluate JavaScript', type: 'assertion',
    description: 'Run custom JavaScript code on the page that returns a boolean.',
    Inputs: [({ ...params }) => <Textarea label="JavaScript Code" placeholder="e.g., return document.title === 'My Page';" autosize minRows={2} {...params} />],
    getDescription: (step) => step?.values[0] ? `${step?.values[0].substring(0, 30)}${step?.values[0].length > 30 ? '...' : ''}` : '',
    validate: (values) => !!values[0],
  },
];