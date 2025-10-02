import { useEffect, useState } from 'react';
import { Card, TextInput, Button, Title, Divider, Text, Modal, ThemeIcon, Blockquote, SimpleGrid, Flex, Box, ActionIcon, Accordion, Input, Textarea, NumberInput, Select, Tooltip, LoadingOverlay, List, Loader } from '@mantine/core';
import Layout from '@/components/Layout/Layout'
import { IconCheck, IconMenuOrder, IconPencil, IconPlaylistAdd, IconReorder, IconTrash, IconX } from '@tabler/icons-react';
import { ReactSortable } from "react-sortablejs";
import { useParams } from 'react-router-dom';
import { useAuthSWR } from '@/utils/useAuthSWR'
import Website404 from '@/components/Website/Website404';
import { isValidUrl } from '@/utils/helper';
import getFormData from '@/utils/getFormData'

const STEP_TYPES = [
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

function CustomFlows() {
  const { id } = useParams();
  const { data: websites = [], isLoading: isLoadingWebsites } = useAuthSWR(`${import.meta.env.VITE_API_URL}/v1/website`)
  const { data: flows = [], mutate: mutateFlows, isLoading: isLoadingFlows } = useAuthSWR(id && `${import.meta.env.VITE_API_URL}/v1/flows?websiteId=${id}`)
  const website = websites.find(w => w.index === id)

  if (!isLoadingWebsites && !website) {
    return (
      <Website404 />
    )
  }

  const [validation, setValidation] = useState([])
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState([]);
  const [editId, setEditId] = useState(null);
  const [modalOpenStep, setModalOpenStep] = useState(null);

  useEffect(() => {
    if (flows.find(f => f.status?.state === 'waiting' || f.status?.state === 'active')) {
      const interval = setInterval(() => {
        mutateFlows()
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [flows])

  const closeModal = () => {
    setEditId(null)
    setSteps([])
    setValidation([])
    setModalOpen(false)
    setModalOpenStep(null)
  }

  const openNewFlowModal = () => {
    setModalOpen(true)
    setSteps([{
      type: 'goto',
      values: [website.domain],
    }])
  };

  const saveChecks = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    const valid = []
    for (const step of steps) {
      const stepDetails = STEP_TYPES.find(s => s.value === step.type)
      const isValid = stepDetails.validate(step.values)
      valid.push(isValid)
    }

    setValidation(valid)

    if (valid.every(v => v)) {
      const newCheck = {
        name: formData.name,
        steps: steps.map(s => ({ type: s.type, values: s.values })),
        editId,
      }
      setLoading(true)

      await fetch(`${import.meta.env.VITE_API_URL}/v1/flows`, {
        method: editId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ check: newCheck, websiteId: website.id }),
      }).then(res => res.json())
        .then(({ id }) => {
          mutateFlows()
          closeModal()
        })
        .finally(() => {
          setLoading(false)
        })
    }
  };

  const deleteFlow = async (flowId) => {
    setDeleteLoading(flowId)
    await fetch(`${import.meta.env.VITE_API_URL}/v1/flows/${flowId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(() => {
      mutateFlows()
    }).finally(() => setDeleteLoading(false))
  }

  const editFlow = (flow) => {
    setSteps(flow.steps)
    setEditId(flow._id)
    setModalOpen(true)
  }

  const addStep = (value) => {
    const defaultValues = []
    if (value === 'url' || value === 'goto') {
      defaultValues.push(website.domain)
    }
    setSteps(prev => [...prev, { type: value, values: defaultValues }])
    setModalOpenStep(`step-${steps.length}`)
  }

  const submitDisabled = !steps.filter(step => STEP_TYPES.find(type => type.value === step.type)?.type === 'assertion').length
  const stepButtonDisabled = steps.length >= 10

  return (
    <Layout title="Custom Test Flows">
      <Title order={1} ta="center" my="md">Custom Test Flows</Title>

      <LoadingOverlay visible={isLoadingFlows || isLoadingWebsites} />

      <Blockquote p="md" maw={600} mx="auto" mb="xl">
        Custom test flows allow you to define a series of actions and assertions to be executed on your website.

        <br /><br />You can create multiple flows, each consisting of various steps like navigating to a URL, clicking elements, filling forms, and verifying content.
      </Blockquote>

      {flows.length > 0 && (
        <Box maw={600} mx="auto" mb="xl">
          {flows.map(flow => {
            const latestResult = flow?.latestResult?.result
            const latestCheckSteps = latestResult?.details?.steps || []

            return (<Card key={flow._id} withBorder p="md" shadow="md" mb="md">
              <Flex justify="space-between" mb="md">
                <Text fw={600}>{flow.name}</Text>
                <Flex gap="xs">
                  <ActionIcon variant="outline" color="blue" onClick={() => editFlow(flow)}>
                    <IconPencil aria-label="Edit flow" />
                  </ActionIcon>
                  <ActionIcon variant="outline" color="red" onClick={() => deleteFlow(flow._id)} loading={deleteLoading === flow._id}>
                    <IconTrash aria-label="Delete flow" />
                  </ActionIcon>
                </Flex>
              </Flex>

              <Accordion variant="separated" styles={flow.status?.state !== 'completed' ? {
                chevron: { display: 'none' },
                control: { opacity: 1 }
              } : {}}>
                <Accordion.Item value="steps">
                  <Accordion.Control disabled={flow?.status?.state !== 'completed'}>
                    {latestResult && flow?.status?.state === 'completed'
                      && (latestResult?.status === 'success' ? <Flex gap="xs" align="center">
                        <ThemeIcon color="green" size="xs" radius="sm">
                          <IconCheck />
                        </ThemeIcon>
                        <Text c="green" fw={500}>Last run successful</Text>
                        <Text c="dimmed">{new Date(flow?.latestResult?.createdAt).toLocaleString()}</Text>
                      </Flex>
                        : <Flex gap="xs" align="center">
                          <ThemeIcon color="red" size="xs" radius="sm">
                            <IconX />
                          </ThemeIcon>
                          <Text c="red" fw={500}>Last run failed</Text>
                          <Text c="dimmed">{new Date(flow?.latestResult?.createdAt).toLocaleString()}</Text>
                        </Flex>)
                    }

                    {flow?.status?.state === 'waiting' && (
                      <Flex gap="xs" align="center">
                        <Loader type="bars" size="xs" />
                        <Text c="blue" fw={500}>Test flow is queued {flow?.status?.waitingIndex !== null ? `(#${flow.status.waitingIndex + 1})` : ''}</Text>
                      </Flex>
                    )}

                    {flow?.status?.state === 'active' && (
                      <Flex gap="xs" align="center">
                        <Loader type="bars" size="xs" />
                        <Text c="blue" fw={500}>Test flow is running...</Text>
                      </Flex>
                    )}

                    {flow?.status?.state === 'failed' && (
                      <Flex gap="xs" align="center">
                        <ThemeIcon color="red" size="xs" radius="sm">
                          <IconX />
                        </ThemeIcon>
                        <Text c="red" fw={500}>An unexpected error occurred</Text>
                      </Flex>
                    )}
                  </Accordion.Control>
                  <Accordion.Panel>
                    <List pl="xs">
                      {latestCheckSteps.map((stepResult, idx) => {
                        const step = flow.steps[idx] || { type: 'unknown', values: [] }
                        const stepDetails = STEP_TYPES.find(s => s.value === step.type)

                        return (
                          <List.Item
                            key={`flow-${flow._id}-step-${idx}`}
                            icon={<ThemeIcon color={stepResult.error ? 'red' : 'green'} size="xs" radius="sm" mt="4px">
                              {stepResult.error ? <IconX /> : <IconCheck />}
                            </ThemeIcon>}
                            styles={{ itemWrapper: { alignItems: 'flex-start' } }}
                          >
                            <Text>
                              {stepDetails.label}: {stepDetails.getDescription ? stepDetails.getDescription(step) : ''}
                            </Text>
                            {stepResult.error && (
                              <List>
                                <List.Item c="red">
                                  Error: {stepResult.error}
                                </List.Item>
                              </List>
                            )}
                          </List.Item>
                        )
                      })}
                    </List>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Card>)
          })}
        </Box>
      )}

      <Card withBorder p="md" shadow="md" maw={600} mx="auto" onClick={openNewFlowModal} style={{ cursor: 'pointer' }}>
        <ThemeIcon variant="outline" size="xl" mb="md" mx="auto">
          <IconPlaylistAdd />
        </ThemeIcon>
        <Text align="center">
          {flows.length === 0 && <>No custom test flows defined yet.<br /></>}
          Click to create a new test flow.
        </Text>
      </Card>

      <Modal opened={modalOpen} onClose={closeModal} title="Create New Test Flow" size="lg">
        <form onSubmit={saveChecks}>
          <TextInput
            label="Test Flow Name"
            placeholder="What is this test flow about?"
            name="name"
            required
            mb="md"
            defaultValue={editId && flows.find(f => f._id === editId)?.name}
          />

          {steps.length > 0 && <Text mb="xs" size="sm">Steps</Text>}
          <Accordion
            variant="contained"
            styles={{
              control: { padding: 0, paddingRight: 10 },
              label: { padding: 0 }
            }}
            value={modalOpenStep}
            onChange={setModalOpenStep}
          >
            <ReactSortable list={steps} setList={setSteps} handle=".drag-handle">
              {steps.map((step, idx) => {
                const isInvalid = validation[idx] === false
                const stepDetails = STEP_TYPES.find(s => s.value === step.type)
                const StepInputs = stepDetails?.Inputs || [() => <Box>No input available for this step type.</Box>]
                return <Accordion.Item key={`step-${idx}`} value={`step-${idx}`} p="0">
                  <Accordion.Control>
                    <Flex gap="sm" align="center">
                      <ThemeIcon size="lg" className="drag-handle" variant="light" color="gray" style={{ cursor: 'grab' }}>
                        <IconMenuOrder />
                      </ThemeIcon>
                      <Text weight={500} c={isInvalid ? 'red' : ''} fw={isInvalid ? 600 : 400}>{stepDetails?.label}</Text>
                      <Text c={isInvalid ? 'red' : 'dimmed'} size="sm" style={{ flexGrow: 1 }} truncate maw={300}>
                        {stepDetails.getDescription ? stepDetails.getDescription(step) : ''}
                      </Text>
                    </Flex>
                  </Accordion.Control>
                  <Accordion.Panel pl="xl">
                    <Flex justify="space-between" align="center" mb="sm">
                      {stepDetails?.description && <Text c="dimmed">{stepDetails.description}</Text>}
                      <ActionIcon ml="xs" color="red" size="sm" variant='outline' onClick={() => setSteps(prev => prev.filter((_, i) => i !== idx))}>
                        <IconTrash size="70%" />
                      </ActionIcon>
                    </Flex>
                    {StepInputs.map((InputComponent, inputIdx) => (
                      <InputComponent
                        key={`step-input-${idx}-${inputIdx}`}
                        value={step.values ? step.values[inputIdx] : ''}
                        onChange={(e) => {
                          const value = e.currentTarget ? e.currentTarget.value : e;
                          setSteps(prev => {
                            const newSteps = [...prev];
                            const stepValues = [...(newSteps[idx].values || [])];
                            stepValues[inputIdx] = value;
                            newSteps[idx] = { ...newSteps[idx], values: stepValues };
                            return newSteps;
                          });
                          setValidation(prev => {
                            const newValidation = [...prev];
                            newValidation[idx] = undefined;
                            return newValidation;
                          });
                        }}
                      />
                    ))}
                  </Accordion.Panel>
                </Accordion.Item>
              })}
            </ReactSortable>
          </Accordion>

          <Divider mb="sm" mt="lg" />

          {stepButtonDisabled && <Text c="dimmed" size="sm" mb="sm" ta="center">You have reached the maximum number of 10 steps per flow.</Text>}

          <Text order={4} mb="sm" size="sm">Add Action Step</Text>

          <SimpleGrid cols={3} mb="sm">
            {STEP_TYPES.filter(step => step.type === 'action').map(({ value, label }) => (
              <Button
                key={value} variant="outline"
                onClick={() => addStep(value)}
                disabled={stepButtonDisabled}
              >
                {label}
              </Button>
            ))}
          </SimpleGrid>

          <Text order={4} mb="sm" size="sm">Add Check Step</Text>
          <SimpleGrid cols={3}>
            {STEP_TYPES.filter(step => step.type === 'assertion').map(({ value, label }) => (
              <Button
                key={value} variant="outline"
                onClick={() => addStep(value)}
                disabled={stepButtonDisabled}
              >
                {label}
              </Button>
            ))}
          </SimpleGrid>

          <Divider mt="sm" mb="lg" />

          {submitDisabled && <Tooltip label='Your test flow needs to have a "Check Step"'>
            <Button disabled>{editId ? 'Save Changes' : 'Create Test Flow'}</Button>
          </Tooltip>}

          {!submitDisabled && <Button
            type="submit"
            disabled={submitDisabled}
            loading={loading}
          >
            {editId ? 'Save Changes' : 'Create Test Flow'}
          </Button>}
        </form>
      </Modal>
    </Layout>
  )
}

export default CustomFlows
