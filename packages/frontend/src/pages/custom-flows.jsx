import { useState } from 'react';
import {
  Container, Card, TextInput, Button, Group, Select,
  Textarea, Title, Stack, Divider, Code
} from '@mantine/core';
import Layout from '@/components/Layout/Layout'

const STEP_TYPES = [
  { value: 'goto', label: 'Goto URL' },
  { value: 'click', label: 'Click' },
  { value: 'fill', label: 'Fill Input' },
  { value: 'type', label: 'Type' },
  { value: 'waitForSelector', label: 'Wait for Selector' },
  { value: 'waitForTimeout', label: 'Wait Timeout' },
  { value: 'url', label: 'Assert URL' },
  { value: 'expect', label: 'Expect Element' },
  { value: 'evaluate', label: 'Evaluate JS' },
];

function CustomFlows() {
  const [checks, setChecks] = useState([]);

  const addCheck = () => {
    setChecks(prev => [...prev, { name: '', steps: [] }]);
  };

  const removeCheck = (checkIdx) => {
    setChecks(prev => prev.filter((_, idx) => idx !== checkIdx));
  };

  const updateCheckName = (checkIdx, name) => {
    const newChecks = [...checks];
    newChecks[checkIdx].name = name;
    setChecks(newChecks);
  };

  const addStep = (checkIdx) => {
    const newChecks = [...checks];
    newChecks[checkIdx].steps.push({ type: '' });
    setChecks(newChecks);
  };

  const removeStep = (checkIdx, stepIdx) => {
    const newChecks = [...checks];
    newChecks[checkIdx].steps = newChecks[checkIdx].steps.filter((_, idx) => idx !== stepIdx);
    setChecks(newChecks);
  };

  const updateStep = (checkIdx, stepIdx, field, value) => {
    const newChecks = [...checks];
    newChecks[checkIdx].steps[stepIdx][field] = value;
    setChecks(newChecks);
  };

  const saveChecks = async () => {
    console.log(checks);

    fetch(`${import.meta.env.VITE_API_URL}/v1/flows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checks),
    })
  };

  return (
    <Layout title="Custom Test Flows">
      <Title order={2}>Website Test Check Builder</Title>

      <Button mt="md" mr="md" onClick={addCheck}>Add Check</Button>
      <Button mt="md" onClick={saveChecks}>Save</Button>

      <Stack mt="md">
        {checks.map((check, checkIdx) => (
          <Card withBorder key={checkIdx}>
            <Group position="apart">
              <TextInput
                label="Check Name"
                value={check.name}
                onChange={(e) => updateCheckName(checkIdx, e.currentTarget.value)}
              />
              <Button color="red" onClick={() => removeCheck(checkIdx)}>Remove Check</Button>
            </Group>

            <Divider my="sm" />

            {check.steps.map((step, stepIdx) => (
              <Card withBorder mt="sm" key={stepIdx} p="sm" shadow="sm">
                <Group position="apart">
                  <Select
                    label="Step Type"
                    placeholder="Pick one"
                    data={STEP_TYPES}
                    value={step.type}
                    onChange={(val) => updateStep(checkIdx, stepIdx, 'type', val)}
                  />
                  <Button color="red" onClick={() => removeStep(checkIdx, stepIdx)}>Remove Step</Button>
                </Group>

                <Stack mt="sm">
                  {(step.type === 'goto' || step.type === 'url') && (
                    <TextInput
                      label="URL"
                      value={step.url || ''}
                      onChange={(e) => updateStep(checkIdx, stepIdx, 'url', e.currentTarget.value)}
                    />
                  )}

                  {['click', 'fill', 'type', 'waitForSelector', 'expect'].includes(step.type) && (
                    <TextInput
                      label="Selector"
                      value={step.selector || ''}
                      onChange={(e) => updateStep(checkIdx, stepIdx, 'selector', e.currentTarget.value)}
                    />
                  )}

                  {['fill', 'type'].includes(step.type) && (
                    <TextInput
                      label="Value"
                      value={step.value || ''}
                      onChange={(e) => updateStep(checkIdx, stepIdx, 'value', e.currentTarget.value)}
                    />
                  )}

                  {step.type === 'expect' && (
                    <>
                      <TextInput
                        label="Expected Text"
                        value={step.text || ''}
                        onChange={(e) => updateStep(checkIdx, stepIdx, 'text', e.currentTarget.value)}
                      />
                      <Select
                        label="Visible"
                        data={[
                          { value: 'true', label: 'True' },
                          { value: 'false', label: 'False' },
                        ]}
                        value={String(step.visible) || ''}
                        onChange={(val) => updateStep(checkIdx, stepIdx, 'visible', val === 'true')}
                      />
                    </>
                  )}

                  {step.type === 'waitForTimeout' && (
                    <TextInput
                      label="Timeout (ms)"
                      type="number"
                      value={step.timeout || ''}
                      onChange={(e) => updateStep(checkIdx, stepIdx, 'timeout', parseInt(e.currentTarget.value))}
                    />
                  )}

                  {step.type === 'evaluate' && (
                    <Textarea
                      label="JavaScript Code"
                      autosize
                      minRows={2}
                      value={step.script || ''}
                      onChange={(e) => updateStep(checkIdx, stepIdx, 'script', e.currentTarget.value)}
                    />
                  )}
                </Stack>
              </Card>
            ))}

            <Button mt="sm" onClick={() => addStep(checkIdx)}>Add Step</Button>
          </Card>
        ))}
      </Stack>
    </Layout>
  )
}

export default CustomFlows
