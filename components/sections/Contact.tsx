'use client';

import {
  Container,
  VStack,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { FadeIn } from '../motion/FadeIn';
import SectionHeading from '../ui/SectionHeading';

export default function Contact() {
  return (
    <Container as="section" id="contact" py={0}>
      <FadeIn>
        <SectionHeading
          label="Contact"
          title="Open to desktop, Android, and security-focused work."
          description="Email is the fastest way to reach me :)"
        />
        <VStack align="start" gap={4} fontSize="lg">
          <Text>
            <ChakraLink
              href="mailto:mahmoudelfeelig@gmail.com"
              textDecoration="underline"
              _hover={{ color: 'accentGreen' }}
            >
              mahmoudelfeelig@gmail.com
            </ChakraLink>
          </Text>
          <Text>
            <ChakraLink
              href="https://github.com/elephancy"
              target="_blank"
              rel="noopener noreferrer"
              textDecoration="underline"
              _hover={{ color: 'accentGreen' }}
            >
              github.com/elephancy
            </ChakraLink>
          </Text>
          <Text>
            <ChakraLink
              href="https://elfeel.me"
              target="_blank"
              rel="noopener noreferrer"
              textDecoration="underline"
              _hover={{ color: 'accentGreen' }}
            >
              elfeel.me
            </ChakraLink>
          </Text>
        </VStack>
      </FadeIn>
    </Container>
  );
}
