import { Flex, RingProgress, Center, Text, Loader, Box } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

const sizes = {
  md: { ring: 80, text: 'sm', thickness: 8 },
  lg: { ring: 120, text: 'lg', thickness: 12 },
};

export const LoadingChart = ({ size = 'md', label, checkFailed }) => {
  const s = {
    md: { ring: 64, padding: 8, text: 'sm' },
    lg: { ring: 96, padding: 12, text: 'lg' },
  }[size]

  if (checkFailed) {
    return (
      <Flex direction="column" align="center">
        <RingProgress
          size={(sizes[size] || sizes.md).ring}
          roundCaps
          thickness={(sizes[size] || sizes.md).thickness}
          sections={[{ value: 100, color: 'grey' }]}
          label={
            <Center>
              <IconX size={30} stroke={2} color="grey" />
            </Center>
          }
        />

        <Text size={s.text}>{label}</Text>
      </Flex>

    );
  }

  return (
    <Flex direction="column" align="center">
      <Box p={s.padding} pb="0">
        <Loader size={s.ring} />
      </Box>

      <Text size={s.text}>{label}</Text>
    </Flex>

  );
}

export function SSLChart({ status, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[{ value: 100, color: status === 'success' ? 'green' : 'red' }]}
        label={
          <Center>
            {status === 'success' && <IconCheck size={s.icon} stroke={3} color="green" />}
            {status !== 'success' && <IconX size={s.icon} stroke={3} color="red" />}
          </Center>
        }
      />
      <Text size={s.text}>SSL Certificate</Text>
    </Flex>
  );
}

export function HeaderChart({ status, missingHeaders, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[{ value: 100, color: missingHeaders.length === 0 ? 'green' : 'yellow' }]}
        label={
          <Center>
            {status === 'success' && <IconCheck size={s.icon} stroke={3} color="green" />}
            {status !== 'success' && <Text c="yellow" fw="bold" size={s.text}>{missingHeaders.length}</Text>}
          </Center>
        }
      />
      <Text size={s.text}>HTTP Headers</Text>
    </Flex>
  );
}

export function DnsChart({ status, details, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  const failedDns = details ? Object.values(details).filter(d => !d.success) : [];

  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[{ value: 100, color: failedDns.length === 0 ? 'green' : 'yellow' }]}
        label={
          <Center>
            {status === 'success' && <IconCheck size={s.icon} stroke={3} color="green" />}
            {status !== 'success' && <Text c="yellow" fw="bold" size={s.text}>{failedDns.length}</Text>}
          </Center>
        }
      />
      <Text size={s.text}>DNS Records</Text>
    </Flex>
  );
}

export function FuzzChart({ status, files, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[{ value: 100, color: files.length === 0 ? 'green' : 'yellow' }]}
        label={
          <Center>
            {status === 'success' && <IconCheck size={s.icon} stroke={3} color="green" />}
            {status !== 'success' && <Text c="yellow" fw="bold" size={s.text}>{files.length}</Text>}
          </Center>
        }
      />
      <Text size={s.text}>Sensitive Files</Text>
    </Flex>
  );
}

export function PerformanceChart({ performances, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[
          { value: (performances.filter(p => p === 'FAST').length / 6) * 100, color: 'green' },
          { value: (performances.filter(p => p === 'AVERAGE').length / 6) * 100, color: 'yellow' },
          { value: (performances.filter(p => p === 'SLOW').length / 6) * 100, color: 'red' },
          { value: ((performances.filter(p => p === 'NONE').length + (6 - performances.length)) / 6) * 100, color: 'gray' },
        ].filter(s => s.value > 0)}
        label={
          <Center>
            <Text fw="bold" size={s.text}>{performances.filter(p => p === 'FAST').length} / 6</Text>
          </Center>
        }
      />
      <Text size={s.text}>Performance</Text>
    </Flex>
  );
}

export function SEOChart({ score, size = 'md' }) {

  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[
          { value: score, color: 'green' },
        ].filter(s => s.value > 0)}
        label={
          <Center>
            <Text c={score >= 90 ? 'green' : 'yellow'} fw="bold" size={s.text}>{score}%</Text>
          </Center>
        }
      />
      <Text size={s.text}>SEO Score</Text>
    </Flex>
  );
}

export function BrokenLinksChart({ brokenLinks, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[{ value: 100, color: brokenLinks.length === 0 ? 'green' : 'yellow' }]}
        label={
          <Center>
            <Text c={brokenLinks.length === 0 ? 'green' : 'yellow'} fw="bold" size={s.text}>{brokenLinks.length}</Text>
          </Center>
        }
      />
      <Text size={s.text}>Broken Links</Text>
    </Flex>
  );
}

export function AccessibilityChart({ score, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[
          { value: score, color: 'green' },
        ].filter(s => s.value > 0)}
        label={
          <Center>
            <Text c={score >= 90 ? 'green' : 'yellow'} fw="bold" size={s.text}>{score}%</Text>
          </Center>
        }
      />
      <Text size={s.text}>Accessibility</Text>
    </Flex>
  );
}

export function CustomFlowsChart({ checks, customFlowLength, size = 'md' }) {
  const s = sizes[size] || sizes.md;
  return (
    <Flex direction="column" align="center">
      <RingProgress
        size={s.ring}
        roundCaps
        thickness={s.thickness}
        sections={[
          { value: (checks.filter(c => c?.result?.status === 'success').length / customFlowLength) * 100, color: 'green' },
          { value: (checks.filter(c => c?.result?.status !== 'success').length / customFlowLength) * 100, color: 'red' },
        ].filter(s => s.value > 0)}
        label={
          <Center>
            <Text fw="bold" size={s.text}>
              {checks.filter(c => c?.result?.status === 'success').length} / {customFlowLength}
            </Text>
          </Center>
        }
      />
      <Text size={s.text}>Custom Flows</Text>
    </Flex>
  );
}