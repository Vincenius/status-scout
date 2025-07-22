import { Box, Group, Stack, Tooltip, Text, Flex } from "@mantine/core";
import { useEffect, useState, useRef } from "react";

const categoryColors = ['green', 'yellow', 'red']; // Fast, Average, Slow
const categoryMap = {
  'FAST': 'green',
  'AVERAGE': 'yellow',
  'SLOW': 'red',
  'NONE': 'gray'
}

const PerformanceBar = ({ title, metric, unit, mb = '0' }) => {
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

  const last = metric.distributions[metric.distributions.length - 1];
  const maxValue = last.max !== undefined ? last.max : 10000;

  const markerLeft = Math.min(
    (metric.percentile / maxValue) * containerWidth,
    containerWidth
  );

  console.log(metric)

  return (
    <Box mb={mb}>
      <Group justify="space-between" mb="2px">
        <Flex gap="4px" align="center">
          <Box w="8px" h="8px" bg={categoryMap[metric.category]} />
          <Text fw={500}>{title}</Text>
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