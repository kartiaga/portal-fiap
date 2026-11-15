import { useLocalSearchParams } from 'expo-router';

import { LikesSheet } from '@/features/likes/likes-sheet';

/** Folha com quem curtiu a postagem (`formSheet`, configurada em `(app)/_layout.tsx`). */
export default function PostLikesSheet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <LikesSheet postId={id} />;
}
