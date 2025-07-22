import { Card, SimpleGrid, Tooltip } from "@mantine/core";
import { useMediaQuery } from '@mantine/hooks'

const Chart = ({ data = [] }) => {
  // figure out current screen size
  const isXxs = useMediaQuery('(max-width: 24em)');
  const isXs = useMediaQuery('(max-width: 36em)');
  const isSm = useMediaQuery('(max-width: 48em)');
  const isMd = useMediaQuery('(max-width: 62em)');
  const isLg = useMediaQuery('(max-width: 75em)');

  let visibleCount = 40;
  if (isXxs) visibleCount = 20;
  else if (isXs) visibleCount = 30;
  else if (isSm) visibleCount = 40;
  else if (isMd) visibleCount = 20;
  else if (isLg) visibleCount = 30;

  // take only last N items
  const visibleData = data.slice(-visibleCount);

  // pad up to visibleCount
  const paddedData = [
    ...Array.from({ length: Math.max(visibleCount - visibleData.length, 0) }, () => null),
    ...visibleData,
  ];

  return (
    <SimpleGrid
      spacing={3}
      cols={visibleCount}
    >
      {paddedData.map((item, index) =>
        (item && item.result) ? (
          <Tooltip key={index} label={new Date(item.createdAt).toLocaleString()}>
            <Card
              h={40}
              w={10}
              p="0"
              bg={item.result?.status === 'success' ? 'green' : 'red'}
            />
          </Tooltip>
        ) : (
          <Card
            key={index}
            h={40}
            w={10}
            p="0"
            // bg="white"
            withBorder
          />
        )
      )}
    </SimpleGrid>
  );
};

export default Chart