import { useState } from 'react';
import { Card, TextInput, Button, Group, Select, Textarea, Title, Stack, Divider, Text, Modal, ThemeIcon, Blockquote, SimpleGrid, Flex, Box, ActionIcon, Accordion } from '@mantine/core';
import Layout from '@/components/Layout/Layout'
import { IconMenuOrder, IconPlaylistAdd, IconReorder, IconTrash } from '@tabler/icons-react';
import { ReactSortable } from "react-sortablejs";

const STEP_TYPES = [
  { value: 'goto', label: 'Go to URL', type: 'action' }, // todo use path and website as base url?
  { value: 'click', label: 'Click Element', type: 'action' },
  { value: 'fill', label: 'Fill Input', type: 'action' },
  { value: 'type', label: 'Enter text', type: 'action' },
  { value: 'waitForSelector', label: 'Wait for Selector', type: 'action' },
  { value: 'waitForTimeout', label: 'Wait for Timeout', type: 'action' },
  { value: 'url', label: 'Assert URL', type: 'assertion' },
  { value: 'expect', label: 'Check for Element', type: 'assertion' },
  { value: 'evaluate', label: 'Evaluate JavaScript', type: 'assertion' },
];

function CustomFlows() {
  const [checks, setChecks] = useState([]); // todo fetch existing checks
  const [modalOpen, setModalOpen] = useState(false);
  const [steps, setSteps] = useState([]);

  const openNewFlowModal = () => {
    setModalOpen(true)
    setSteps([{
      type: 'goto',
      url: '',
    }])
  };

  const saveChecks = async (e) => {
    e.preventDefault();
    console.log('todo');

    // fetch(`${import.meta.env.VITE_API_URL}/v1/flows`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(checks),
    // })
  };

  return (
    <Layout title="Custom Test Flows">
      <Title order={1} ta="center" my="md">Custom Test Flows</Title>

      <Blockquote p="md" maw={600} mx="auto" mb="xl">
        Custom test flows allow you to define a series of actions and assertions to be executed on your website.

        <br /><br />You can create multiple flows, each consisting of various steps like navigating to a URL, clicking elements, filling forms, and verifying content.
      </Blockquote>

      {checks.length === 0 && (
        <Card withBorder p="md" shadow="md" maw={600} mx="auto" onClick={openNewFlowModal} style={{ cursor: 'pointer', }}>
          <ThemeIcon variant="outline" size="xl" mb="md" mx="auto">
            <IconPlaylistAdd />
          </ThemeIcon>
          <Text align="center">No custom test flows defined yet.<br />Click to create a new test flow.</Text>
        </Card>
      )}

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Create New Test Flow" size="lg">
        <form>
          <TextInput
            label="Test Flow Name"
            placeholder="Enter a name for the test flow"
            name="name"
            required
            mb="md"
          />

          {steps.length > 0 && <Text mb="xs" size="sm">Steps</Text>}
          <Accordion variant="contained" styles={{
            control: { padding: 0, paddingRight: 10 },
            label: { padding: 0 }
          }}>
            <ReactSortable list={steps} setList={setSteps} handle=".drag-handle">
              {steps.map((step, idx) => (
                <>
                  <Accordion.Item key={`step-${idx}`} value={`step-${idx}`} p="0">
                    <Accordion.Control>
                      <Flex gap="sm" align="center">
                        <ThemeIcon size="lg" className="drag-handle" variant="light" color="gray" style={{ cursor: 'grab' }}>
                          <IconMenuOrder />
                        </ThemeIcon>
                        <Text weight={500}>{STEP_TYPES.find(s => s.value === step.type)?.label}</Text>
                        {/* todo text with details as preview */}
                      </Flex>
                    </Accordion.Control>
                    <Accordion.Panel>todo</Accordion.Panel>
                  </Accordion.Item>
                </>
              ))}
            </ReactSortable>
          </Accordion>


          {/* <ActionIcon m="xs" color="red" size="sm" variant='outline' onClick={() => setSteps(prev => prev.filter((_, i) => i !== idx))}>
              <IconTrash size="70%" />
            </ActionIcon> */}

          <Divider mb="sm" mt="lg" />

          <Text order={4} mb="sm" size="sm">Add Action Step</Text>

          <SimpleGrid cols={3} mb="sm">
            {STEP_TYPES.filter(step => step.type === 'action').map(({ value, label }) => (
              <Button key={value} variant="outline" onClick={() => setSteps(prev => [...prev, { type: value }])}>
                {label}
              </Button>
            ))}
          </SimpleGrid>

          <Text order={4} mb="sm" size="sm">Add Check Step</Text>
          <SimpleGrid cols={3}>
            {STEP_TYPES.filter(step => step.type === 'assertion').map(({ value, label }) => (
              <Button key={value} variant="outline" onClick={() => setSteps(prev => [...prev, { type: value }])}>
                {label}
              </Button>
            ))}
          </SimpleGrid>

          <Divider mt="sm" mb="lg" />

          <Button type="submit" onClick={saveChecks} disabled={!steps.filter(step => step.type === 'assertion').length}>
            Create Test Flow
          </Button>
        </form>

      </Modal>
      {/* todo show list of checks */}

      {/* todo new flow in modal */}
      {/* <Button mt="md" mr="md" onClick={addCheck}>Add Check</Button>
      <Button mt="md" onClick={saveChecks}>Save</Button> */}

      {/* <Stack mt="md">
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
      </Stack> */}
    </Layout>
  )
}

export default CustomFlows
