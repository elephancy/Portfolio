'use client';

import { useState, useEffect } from 'react';
import { Box, Flex, Text, Link, IconButton, Icon } from '@chakra-ui/react';
import Image from 'next/image';
import {
  ArrowUpIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { FaGithub } from 'react-icons/fa';


export default function Footer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Box
      as="footer"
      mt={32}
      borderTop="1px solid"
      borderColor="whiteAlpha.100"
      bg="rgba(7,10,17,0.28)"
      py={12}
      fontSize="sm"
      color="rgba(230,237,247,0.76)"
    >
      <Flex
        maxW="4xl"
        mx="auto"
        px={6}
        direction={{ base: 'column', md: 'row' }}
        align="center"
        justify="space-between"
        gap={6}
      >
        <Box textAlign={{ base: 'center', md: 'left' }}>
          <Text>© Mahmoud Elfeel</Text>
          <Text fontSize="xs" opacity={0.6}>
          </Text>
        </Box>

        <Flex align="center" gap={4}>
          <Link
            href="mailto:mahmoudelfeelig@gmail.com"
            _hover={{ color: 'accentGreen' }}
            aria-label="Email"
          >
            <Icon as={EnvelopeIcon} boxSize={5} />
          </Link>
          <Link
            href="https://github.com/elephancy"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: 'accentGreen' }}
            aria-label="GitHub"
          >
            <Icon as={FaGithub} boxSize={5} />
          </Link>
          <Link
            href="https://elfeel.me"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ color: 'accentGreen' }}
            aria-label="Website"
            display="inline-flex"
            alignItems="center"
          >
            <Image
              src="/Logo-transparent.png"
              alt="Mahmoud Elfeel logo"
              width={20}
              height={20}
              style={{ borderRadius: 9999 }}
            />
          </Link>
        </Flex>
      </Flex>

      {visible && (
        <IconButton
          position="fixed"
          bottom={6}
          right={6}
          zIndex={50}
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          bg="rgba(0, 224, 166, 0.18)"
          _hover={{ bg: 'rgba(0, 224, 166, 0.3)' }}
          backdropFilter="blur(10px)"
          size="md"
        >
          <Icon as={ArrowUpIcon} boxSize={5} />
        </IconButton>
      )}
    </Box>
  );
}
