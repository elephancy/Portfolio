'use client';

import { Box, Text, Button, Link, HStack, VStack, Grid, GridItem } from '@chakra-ui/react';
import styles from './hero.module.css';

export default function Hero() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.overlay} />
      <Grid className={styles.heroGrid} templateColumns={{ base: '1fr', lg: '2.1fr 1fr' }} gap={{ base: 10, lg: 12 }}>
        <GridItem>
          <VStack className={styles.titleBox} gap={5} align="start">
            <Text className={styles.kicker}>Tech-forward engineer portfolio</Text>
            <h1 className={styles.title}>Mahmoud Elfeel</h1>
            <Text className={styles.subtitle}>
              Desktop and Android developer focused on useful software, secure networking, and product-facing tooling.
            </Text>
            <HStack gap={3} flexWrap="wrap">
              <Text className={styles.pill}>Desktop apps</Text>
              <Text className={styles.pill}>Android</Text>
              <Text className={styles.pill}>Network security</Text>
              <Text className={styles.pill}>Computer vision</Text>
            </HStack>
            <HStack gap={3} pt={2} flexWrap="wrap">
              <Link href="#projects" _hover={{ textDecoration: 'none' }}>
                <Button bg="accentGreen" color="black" size="md" rounded="full" _hover={{ bg: 'accentLight' }}>
                  View projects
                </Button>
              </Link>
              <Link href="#experience" _hover={{ textDecoration: 'none' }}>
                <Button variant="outline" borderColor="whiteAlpha.300" color="white" size="md" rounded="full" _hover={{ bg: 'whiteAlpha.100' }}>
                  View experience
                </Button>
              </Link>
            </HStack>
          </VStack>
        </GridItem>
        <GridItem>
          <Box className={styles.metaPanel}>
            <Text className={styles.metaLabel}>Current role</Text>
            <Text className={styles.metaValue}>Resistine GmbH</Text>
            <Text className={styles.metaDetail}>Desktop and Android development, security tasks</Text>

            <Box className={styles.metaDivider} />

            <Text className={styles.metaLabel}>Location</Text>
            <Text className={styles.metaValue}>Germany</Text>

            <Box className={styles.metaDivider} />

            <Text className={styles.metaLabel}>Focus areas</Text>
            <VStack align="start" gap={1.5} mt={2}>
              <Text className={styles.metaBullet}>Internal tools and operations software</Text>
              <Text className={styles.metaBullet}>Android support applications</Text>
              <Text className={styles.metaBullet}>Network monitoring and hardening</Text>
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </section>
  );
}
