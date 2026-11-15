import { Stack, useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSession } from '@/auth/session-context';
import { Avatar } from '@/components/avatar';
import { Banner } from '@/components/banner';
import { HeaderButton } from '@/components/header-button';
import { CommentButton, LikeButton } from '@/components/post-engagement';
import { LoadingState, StateMessage } from '@/components/state-message';
import { useLikeToggle } from '@/hooks/use-like-toggle';
import { useNotice } from '@/hooks/use-notice';
import { usePost } from '@/hooks/use-post';
import { useTheme } from '@/hooks/use-theme';
import { formatDate } from '@/lib/format';
import { takeFlashNotice } from '@/lib/notice';
import { canModifyPost } from '@/lib/permissions';
import type { LikeSummary } from '@/lib/posts';
import { BorderWidth, MaxContentWidth, MinTouchSize, Spacing, Typography } from '@/theme';

/** "Ver o comentário", "Ver os 3 comentários" ou, sem nenhum, o convite para comentar. */
function commentsLinkLabel(count: number): string {
  if (count === 0) return 'Adicionar um comentário';
  return count === 1 ? 'Ver o comentário' : `Ver os ${count} comentários`;
}

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const { post, loaded, notFound, loadError, reload, patchPost } = usePost(id);
  const { notice, showNotice, clearNotice } = useNotice();

  const applyLike = useCallback((_: string, summary: LikeSummary) => patchPost(summary), [patchPost]);
  const showError = useCallback((text: string) => showNotice({ kind: 'error', text }), [showNotice]);
  const toggleLike = useLikeToggle(applyLike, showError);

  // Recarrega ao voltar para a tela: reflete uma edição recente e os totais depois de fechar a
  // folha de comentários ou de curtidas. Mostra também o aviso deixado pela tela anterior.
  useFocusEffect(
    useCallback(() => {
      showNotice(takeFlashNotice());
      void reload();
    }, [reload, showNotice]),
  );

  function goToList() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  if (!loaded) return <LoadingState label="Carregando postagem" />;

  if (!post) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <StateMessage
          tone="error"
          message={loadError ?? ''}
          actionLabel={notFound ? 'Voltar para a lista' : 'Tentar novamente'}
          onAction={notFound ? goToList : () => void reload()}
        />
      </View>
    );
  }

  const author = post.authorName || 'Autor não informado';
  const createdAt = formatDate(post.createdAt);
  const updatedAt = formatDate(post.updatedAt);
  const commentCount = post.commentCount ?? 0;
  const openComments = () => router.push(`/posts/${post.id}/comments` as Href);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      {/*
        Ler é a tarefa desta tela: editar fica no cabeçalho, e excluir, no fim da edição
        (mesmo modelo da edição de pessoa).
      */}
      <Stack.Screen
        options={{
          headerRight: canModifyPost(user, post)
            ? () => (
                <HeaderButton
                  label="Editar"
                  accessibilityLabel={`Editar ${post.title}`}
                  onPress={() => router.push(`/posts/${post.id}/edit` as Href)}
                />
              )
            : undefined,
        }}
      />

      {/* A postagem já está na tela, então uma falha ao atualizar não a esconde. */}
      {loadError ? <Banner text={loadError} /> : null}
      {!loadError && notice ? (
        <Banner
          kind={notice.kind}
          text={notice.text}
          onDismiss={notice.kind === 'success' ? undefined : clearNotice}
        />
      ) : null}

      <Text
        accessibilityRole="header"
        selectable
        style={[Typography.article, { color: theme.text }]}>
        {post.title}
      </Text>

      <View style={styles.author}>
        <Avatar name={post.authorName} />
        <View style={styles.authorText}>
          <Text numberOfLines={1} style={[Typography.label, { color: theme.text }]}>
            Por {author}
          </Text>
          {createdAt ? (
            <Text style={[Typography.callout, { color: theme.textSecondary }]}>
              Publicada em {createdAt}
            </Text>
          ) : null}
          {updatedAt && updatedAt !== createdAt ? (
            <Text style={[Typography.callout, { color: theme.textSecondary }]}>
              Atualizada em {updatedAt}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Text selectable style={[Typography.reading, { color: theme.text }]}>
        {post.content}
      </Text>

      {/* Os comentários ficam numa folha: aqui, só os totais e os atalhos para abri-la. */}
      <View style={[styles.engagement, { borderTopColor: theme.border }]}>
        <View style={styles.stats}>
          <LikeButton
            liked={post.likedByMe ?? false}
            count={post.likeCount ?? 0}
            onToggle={() => void toggleLike(post)}
            onOpenLikes={() => router.push(`/posts/${post.id}/likes` as Href)}
          />
          <CommentButton count={commentCount} onPress={openComments} />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={openComments}
          style={({ pressed }) => [styles.commentsLink, pressed && { opacity: 0.6 }]}>
          <Text style={[Typography.callout, { color: theme.textSecondary }]}>
            {commentsLinkLabel(commentCount)}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  authorText: {
    flex: 1,
    gap: Spacing.half,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
  engagement: {
    marginTop: Spacing.two,
    paddingTop: Spacing.one,
    borderTopWidth: BorderWidth.hairline,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    // O coração tem respiro próprio: o recuo negativo o alinha ao texto.
    marginStart: -Spacing.two + Spacing.half,
  },
  commentsLink: {
    alignSelf: 'flex-start',
    minHeight: MinTouchSize,
    justifyContent: 'center',
  },
});
