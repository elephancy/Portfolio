'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Container, Flex, HStack, Input, Spinner, Text, VisuallyHidden, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import ProjectCard from '../ui/ProjectCard';
import SectionHeading from '../ui/SectionHeading';
import { useGithubRepoDetails } from '../../hooks/useGithubRepoDetails';

type RepoItem = {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  topics: string[];
  domain: string;
  techStack: string[];
  features: string[];
};

type ApiResponse = {
  repos?: RepoItem[];
  error?: string;
  source?: string;
};

const GRAPH_PADDING = 6;
const LANE_HEIGHT = 70;
const MAX_LANES = 5;
const MotionButton = motion.create(Button);

function yearOf(dateValue: string) {
  return new Date(dateValue).getFullYear().toString();
}

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function timelinePercent(timestamp: number, start: number, end: number) {
  if (start >= end) {
    return 50;
  }

  const progress = (timestamp - start) / (end - start);
  return Math.max(GRAPH_PADDING, Math.min(100 - GRAPH_PADDING, GRAPH_PADDING + progress * (100 - GRAPH_PADDING * 2)));
}

export default function CareerCalendar() {
  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [staticFallback, setStaticFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<'all' | string>('all');
  const [selectedDomain, setSelectedDomain] = useState<'all' | string>('all');
  const [search, setSearch] = useState('');
  const [activeRepoName, setActiveRepoName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadRepos() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/github/repos');
        const data = (await response.json()) as ApiResponse;

        if (!response.ok || !data.repos) {
          throw new Error(data.error ?? 'Failed to load repositories');
        }

        if (active) {
          setRepos(data.repos);
          setStaticFallback(data.source === 'portfolio-static-fallback');
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load repositories');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRepos();

    return () => {
      active = false;
    };
  }, []);

  const years = useMemo(() => {
    const set = new Set(repos.map((repo) => yearOf(repo.pushedAt)));
    return [...set].sort((a, b) => Number(b) - Number(a));
  }, [repos]);

  const domains = useMemo(() => {
    const set = new Set(repos.map((repo) => repo.domain));
    return ['all', ...[...set].sort((a, b) => a.localeCompare(b))];
  }, [repos]);

  const filteredRepos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return repos.filter((repo) => {
      const matchesYear = selectedYear === 'all' || yearOf(repo.pushedAt) === selectedYear;
      const matchesDomain = selectedDomain === 'all' || repo.domain === selectedDomain;
      const matchesQuery =
        query.length === 0 ||
        repo.name.toLowerCase().includes(query) ||
        (repo.description ?? '').toLowerCase().includes(query) ||
        repo.techStack.some((item) => item.toLowerCase().includes(query));

      return matchesYear && matchesDomain && matchesQuery;
    });
  }, [repos, search, selectedDomain, selectedYear]);

  const graphModel = useMemo(() => {
    const sorted = [...filteredRepos].sort((a, b) => +new Date(a.pushedAt) - +new Date(b.pushedAt));

    if (sorted.length === 0) {
      return {
        points: [] as Array<{
          repo: RepoItem;
          left: number;
          top: number;
          timestamp: number;
        }>,
        tickYears: [] as string[],
        laneCount: 3,
        start: 0,
        end: 1,
      };
    }

    const timestamps = sorted.map((repo) => +new Date(repo.pushedAt));
    const rawStart = Math.min(...timestamps);
    const rawEnd = Math.max(...timestamps);
    const padding = Math.max(1000 * 60 * 60 * 24 * 14, Math.round((rawEnd - rawStart) * 0.06));
    const start = rawStart - padding;
    const end = rawEnd + padding;
    const laneCount = Math.min(MAX_LANES, Math.max(3, Math.ceil(sorted.length / 4)));
    const tickStartYear = new Date(start).getFullYear();
    const tickEndYear = new Date(end).getFullYear();
    const tickYears = Array.from({ length: tickEndYear - tickStartYear + 1 }, (_, index) => String(tickStartYear + index));
    const points = sorted.map((repo, index) => {
      const timestamp = +new Date(repo.pushedAt);
      return {
        repo,
        left: timelinePercent(timestamp, start, end),
        top: 44 + (index % laneCount) * LANE_HEIGHT,
        timestamp,
      };
    });

    return { points, tickYears, laneCount, start, end };
  }, [filteredRepos]);

  useEffect(() => {
    if (filteredRepos.length === 0) {
      setActiveRepoName(null);
      return;
    }

    if (!activeRepoName || !filteredRepos.some((repo) => repo.name === activeRepoName)) {
      const latestRepo = [...filteredRepos].sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt))[0];
      setActiveRepoName(latestRepo.name);
    }
  }, [activeRepoName, filteredRepos]);

  const activeRepoSummary = filteredRepos.find((repo) => repo.name === activeRepoName) ?? null;
  const activeRepoDetail = useGithubRepoDetails(activeRepoSummary?.name);
  const activeRepo = activeRepoDetail ?? activeRepoSummary;
  const activePoint = graphModel.points.find((point) => point.repo.name === activeRepo?.name) ?? null;
  const plotHeight = graphModel.laneCount * LANE_HEIGHT + 40;

  if (loading) {
    return (
      <Container as="section" id="projects" py={0} maxW="6xl">
        <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="3xl" p={6} bg="rgba(10, 14, 22, 0.66)">
          <HStack gap={3}>
            <Spinner size="sm" />
            <Text color="gray.300">Loading project graph...</Text>
          </HStack>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container as="section" id="projects" py={0} maxW="6xl">
        <Box border="1px solid" borderColor="whiteAlpha.100" borderRadius="3xl" p={6} bg="rgba(10, 14, 22, 0.66)">
          <Text color="red.300">Project graph unavailable: {error}</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container as="section" id="projects" py={0} maxW="6xl">
      <SectionHeading
        label="Project Graph"
        title="One timeline for the full repository set"
        description="Hover or tap a node to inspect the project without switching between a separate list and calendar."
      />

      <Box
        position="relative"
        overflow="hidden"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="3xl"
        bg="linear-gradient(135deg, rgba(8, 12, 18, 0.96), rgba(15, 21, 30, 0.82))"
        p={{ base: 4, md: 6 }}
      >
        <Box position="absolute" inset={0} bg="radial-gradient(circle at top right, rgba(0, 182, 124, 0.14), transparent 30%), radial-gradient(circle at bottom left, rgba(191, 224, 255, 0.12), transparent 28%)" />

        <VStack position="relative" align="stretch" gap={5}>
          <Flex direction={{ base: 'column', xl: 'row' }} gap={3} align={{ base: 'stretch', xl: 'center' }} justify="space-between">
            <HStack gap={2} wrap="wrap">
              {years.map((year) => (
                <Button
                  key={year}
                  size="sm"
                  onClick={() => setSelectedYear(year === selectedYear ? 'all' : year)}
                  bg={selectedYear === year ? 'accentGreen' : 'blackAlpha.400'}
                  color={selectedYear === year ? 'black' : 'gray.200'}
                  border="1px solid"
                  borderColor={selectedYear === year ? 'accentGreen' : 'whiteAlpha.200'}
                >
                  {year}
                </Button>
              ))}
              <Button
                size="sm"
                onClick={() => setSelectedYear('all')}
                variant={selectedYear === 'all' ? 'solid' : 'outline'}
                colorScheme="green"
              >
                All years
              </Button>
            </HStack>

            <HStack gap={2} wrap="wrap">
              {domains.map((domain) => (
                <Button
                  key={domain}
                  size="sm"
                  onClick={() => setSelectedDomain(domain)}
                  bg={selectedDomain === domain ? 'accentLight' : 'blackAlpha.400'}
                  color={selectedDomain === domain ? 'black' : 'gray.200'}
                  border="1px solid"
                  borderColor={selectedDomain === domain ? 'accentLight' : 'whiteAlpha.200'}
                >
                  {domain === 'all' ? 'All domains' : domain}
                </Button>
              ))}
            </HStack>
          </Flex>

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repo, stack, or description"
            bg="blackAlpha.300"
            borderColor="whiteAlpha.300"
          />

          <Box
            position="relative"
            minH={`${plotHeight}px`}
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="2xl"
            bg="rgba(6, 10, 16, 0.55)"
            px={{ base: 3, md: 5 }}
            py={5}
          >
            {Array.from({ length: graphModel.laneCount }).map((_, lane) => (
              <Box
                key={`lane-${lane}`}
                position="absolute"
                left={0}
                right={0}
                top={`${44 + lane * LANE_HEIGHT}px`}
                h="1px"
                bg="whiteAlpha.100"
              />
            ))}

            {graphModel.tickYears.map((year) => {
              const tickDate = new Date(`${year}-01-01T00:00:00`);
              const left = timelinePercent(tickDate.getTime(), graphModel.start, graphModel.end);

              return (
                <Box key={year} position="absolute" top={0} bottom={0} left={`${left}%`}>
                  <Box position="absolute" top={0} bottom={0} w="1px" bg="whiteAlpha.100" />
                  <Text
                    position="absolute"
                    top="0.2rem"
                    transform="translateX(-50%)"
                    color="gray.500"
                    fontSize="xs"
                    letterSpacing="0.22em"
                    textTransform="uppercase"
                  >
                    {year}
                  </Text>
                </Box>
              );
            })}

            {graphModel.points.map(({ repo, left, top }, index) => {
              const isActive = repo.name === activeRepo?.name;
              return (
                <MotionButton
                  key={repo.name}
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.24, delay: Math.min(index * 0.02, 0.18) }}
                  onMouseEnter={() => setActiveRepoName(repo.name)}
                  onFocus={() => setActiveRepoName(repo.name)}
                  onClick={() => setActiveRepoName(repo.name)}
                  position="absolute"
                  left={`${left}%`}
                  top={`${top}px`}
                  transform="translate(-50%, -50%)"
                  w={isActive ? '1.15rem' : '0.85rem'}
                  h={isActive ? '1.15rem' : '0.85rem'}
                  minW={0}
                  p={0}
                  borderRadius="full"
                  bg={isActive ? 'accentGreen' : 'accentLight'}
                  border="2px solid"
                  borderColor="rgba(6, 10, 16, 0.94)"
                  boxShadow={isActive ? '0 0 0 8px rgba(0, 182, 124, 0.16)' : '0 0 0 5px rgba(191, 224, 255, 0.08)'}
                  transitionProperty="transform, width, height, box-shadow, background-color"
                  transitionDuration="0.18s"
                  transitionTimingFunction="ease"
                  _hover={{ transform: 'translate(-50%, -50%) scale(1.08)' }}
                  _focusVisible={{ outline: 'none', boxShadow: '0 0 0 8px rgba(0, 182, 124, 0.22)' }}
                  aria-label={`Show ${repo.name}`}
                >
                  <VisuallyHidden as="span">
                    {repo.name}
                  </VisuallyHidden>
                </MotionButton>
              );
            })}

            {activeRepo && activePoint && (
              <Box
                position="absolute"
                left={`${activePoint.left}%`}
                top={`${activePoint.top - 32}px`}
                transform="translateX(-50%)"
                px={3}
                py={1.5}
                borderRadius="full"
                bg="rgba(7, 10, 15, 0.92)"
                border="1px solid"
                borderColor="whiteAlpha.200"
                pointerEvents="none"
              >
                <Text color="white" fontSize="xs" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase">
                  {activeRepo.name}
                </Text>
              </Box>
            )}
          </Box>

          {activeRepo ? (
            <ProjectCard
              title={activeRepo.name}
              shortDesc={activeRepo.description ?? 'Repository with documented implementation details.'}
              longDesc={staticFallback && !activeRepoDetail
                ? `Portfolio record last updated ${formatDate(activeRepo.updatedAt)}.`
                : `Created ${formatDate(activeRepo.createdAt)} and last updated ${formatDate(activeRepo.pushedAt)}.`}
              year={new Date(activeRepo.pushedAt).getFullYear()}
              techStack={activeRepo.techStack}
              features={activeRepo.features}
              domain={activeRepo.domain}
              repo={activeRepo.url}
              defaultOpen
              hideToggle
            />
          ) : (
            <Text color="gray.400">No projects match this filter set.</Text>
          )}
        </VStack>
      </Box>
    </Container>
  );
}
