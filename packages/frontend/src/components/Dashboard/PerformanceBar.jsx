import { Box, Group, Stack, Tooltip, Text, Flex } from "@mantine/core";
import { useEffect, useState, useRef } from "react";

const categoryColors = ['green', 'yellow', 'red']; // Fast, Average, Slow
const categoryMap = {
  'FAST': 'green',
  'AVERAGE': 'yellow',
  'SLOW': 'red',
  'NONE': 'gray'
}

function calculateMarkerLeft(metric, containerWidth) {
  const distributions = metric.distributions;
  const value = metric.percentile;

  let leftProportion = 0;
  let segmentStart = 0;

  for (let i = 0; i < distributions.length; i++) {
    const { min, max, proportion } = distributions[i];

    const segmentEnd = max !== undefined ? max : value; // For last bucket
    if (value >= min && value <= segmentEnd) {
      // Percentile is in this segment
      const segmentRange = segmentEnd - min;
      const valueWithinSegment = value - min;
      const segmentFraction = segmentRange > 0 ? valueWithinSegment / segmentRange : 0;
      leftProportion += segmentFraction * proportion;
      break;
    } else {
      // Add full segment proportion
      leftProportion += proportion;
    }
  }

  // Scale proportion to container width
  return Math.min(leftProportion * containerWidth, containerWidth);
}

const PerformanceBar = ({ title, metric, unit, mb = '0' }) => {
  if (!metric) return <Box mb={mb}>
    <Group justify="space-between" mb="2px">
      <Flex gap="4px" align="center">
        <Box w="8px" h="8px" bg="gray.5" />
        <Text fw={500} size="sm">{title}</Text>
      </Flex>
      <Text size="sm" c="dimmed">
        no data
      </Text>
    </Group>

    <Box
      bg="gray.5"
      h={20}
      w="100%"
      style={{
        transition: 'width 0.2s ease',
        borderRadius: 4,
      }}
    />
  </Box>;

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // ResizeObserver to track container width
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const proportions = metric.distributions.map((d) => d.proportion);
  const segmentWidths = proportions.map((p) => p * containerWidth);
  const markerLeft = calculateMarkerLeft(metric, containerWidth);

  return (
    <Box mb={mb}>
      <Group justify="space-between" mb="2px">
        <Flex gap="4px" align="center">
          <Box w="8px" h="8px" bg={categoryMap[metric.category]} />
          <Text fw={500} size="sm">{title}</Text>
        </Flex>
        <Text size="sm" c="dimmed">
          {metric.percentile} {unit}
        </Text>
      </Group>

      <Flex
        ref={containerRef}
        h={20}
        w="100%"
        bg="gray.3"
        style={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {segmentWidths.map((width, idx) => (
          <Box
            key={idx}
            bg={categoryColors[idx]}
            style={{
              width,
              height: '100%',
              transition: 'width 0.2s ease',
            }}
          />
        ))}

        {/* Marker */}
        {containerWidth > 0 && (
          <Box
            style={{
              position: 'absolute',
              left: markerLeft,
              transform: 'translateX(-50%)',
              pointerEvents: 'none',
            }}
          >
            <Tooltip label={`Percentile: ${metric.percentile} ${unit}`} withArrow>
              <Box h={20} w={4} bg="white"></Box>
            </Tooltip>
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default PerformanceBar;