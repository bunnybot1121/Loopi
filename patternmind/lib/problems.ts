import { Problem } from '@/types';

export const STATIC_PROBLEMS: Problem[] = [
  // ── ARRAYS (3) ────────────────────────────────────────────────
  {
    id: 'arr-1',
    title: 'Two Sum',
    difficulty: 'easy',
    topic: 'arrays',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    test_cases: [
      { input: '[2,7,11,15]\n9', expected: '[0, 1]' },
      { input: '[3,2,4]\n6', expected: '[1, 2]' },
      { input: '[3,3]\n6', expected: '[0, 1]' },
    ],
    hint: 'Think about what you need to find when you see each number. A hash map can store what you\'ve already seen in O(1) lookup.',
    generated_reason: 'Classic arrays problem to warm up pattern recognition.',
  },
  {
    id: 'arr-2',
    title: 'Maximum Subarray',
    difficulty: 'medium',
    topic: 'arrays',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' },
      { input: 'nums = [1]', output: '1' },
    ],
    test_cases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: '[1]', expected: '1' },
      { input: '[-1,-2,-3,-4]', expected: '-1' },
    ],
    hint: 'At each position, you face a choice: extend the previous subarray or start fresh. What determines that choice?',
    generated_reason: 'Tests Kadane\'s algorithm and greedy thinking.',
  },
  {
    id: 'arr-3',
    title: 'Contains Duplicate',
    difficulty: 'easy',
    topic: 'arrays',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    test_cases: [
      { input: '[1,2,3,1]', expected: 'true' },
      { input: '[1,2,3,4]', expected: 'false' },
      { input: '[1,1,1,3,3,4,3,2,4,2]', expected: 'true' },
    ],
    hint: 'Can you check for duplicates without comparing every pair? Think about what data structure gives O(1) membership checks.',
    generated_reason: 'Tests hash set usage and edge case awareness.',
  },

  // ── TREES (3) ─────────────────────────────────────────────────
  {
    id: 'tree-1',
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'easy',
    topic: 'trees',
    description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

Input format: level-order array representation of the tree (use null for missing nodes).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    test_cases: [
      { input: '[3,9,20,null,null,15,7]', expected: '3' },
      { input: '[1,null,2]', expected: '2' },
      { input: '[]', expected: '0' },
    ],
    hint: 'The depth of a tree is 1 + the maximum depth of its children. What is the base case when you reach a null node?',
    generated_reason: 'Fundamental tree recursion — tests base case handling.',
  },
  {
    id: 'tree-2',
    title: 'Invert Binary Tree',
    difficulty: 'easy',
    topic: 'trees',
    description: `Given the root of a binary tree, invert the tree, and return its root.

Inverting a binary tree means swapping the left and right children of every node.

Input/output format: level-order array (null for missing nodes).`,
    examples: [
      { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' },
      { input: 'root = [2,1,3]', output: '[2,3,1]' },
    ],
    test_cases: [
      { input: '[4,2,7,1,3,6,9]', expected: '[4,7,2,9,6,3,1]' },
      { input: '[2,1,3]', expected: '[2,3,1]' },
      { input: '[]', expected: '[]' },
    ],
    hint: 'Think recursively — if you can invert one node\'s children and then invert each subtree, what is the stopping condition?',
    generated_reason: 'Tree recursion with symmetry — exposes recursion avoidance patterns.',
  },
  {
    id: 'tree-3',
    title: 'Validate Binary Search Tree',
    difficulty: 'medium',
    topic: 'trees',
    description: `Given the root of a binary tree, determine if it is a valid binary search tree (BST).

A valid BST is defined as follows:
- The left subtree of a node contains only nodes with keys less than the node's key.
- The right subtree of a node contains only nodes with keys greater than the node's key.
- Both the left and right subtrees must also be binary search trees.`,
    examples: [
      { input: 'root = [2,1,3]', output: 'true' },
      { input: 'root = [5,1,4,null,null,3,6]', output: 'false' },
    ],
    test_cases: [
      { input: '[2,1,3]', expected: 'true' },
      { input: '[5,1,4,null,null,3,6]', expected: 'false' },
      { input: '[5,4,6,null,null,3,7]', expected: 'false' },
    ],
    hint: 'Comparing only parent-child pairs is not enough. Each node has a valid range — think about passing min/max bounds through recursion.',
    generated_reason: 'Classic BST problem exposing off-by-one and edge case tendencies.',
  },

  // ── RECURSION (2) ─────────────────────────────────────────────
  {
    id: 'rec-1',
    title: 'Fibonacci Number',
    difficulty: 'easy',
    topic: 'recursion',
    description: `The Fibonacci numbers form a sequence such that each number is the sum of the two preceding ones, starting from 0 and 1.

F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2), for n > 1.

Given n, calculate F(n).`,
    examples: [
      { input: 'n = 2', output: '1' },
      { input: 'n = 10', output: '55' },
    ],
    test_cases: [
      { input: '2', expected: '1' },
      { input: '10', expected: '55' },
      { input: '0', expected: '0' },
    ],
    hint: 'Write the recursive solution first. Then ask: how many times is the same F(k) computed? Is there a smarter way?',
    generated_reason: 'Base case handling and recursion vs memoization tradeoff.',
  },
  {
    id: 'rec-2',
    title: 'Power of Two',
    difficulty: 'easy',
    topic: 'recursion',
    description: `Given an integer n, return true if it is a power of two. Otherwise, return false.

An integer n is a power of two if there exists an integer x such that n == 2^x.`,
    examples: [
      { input: 'n = 1', output: 'true' },
      { input: 'n = 16', output: 'true' },
      { input: 'n = 3', output: 'false' },
    ],
    test_cases: [
      { input: '1', expected: 'true' },
      { input: '16', expected: 'true' },
      { input: '3', expected: 'false' },
    ],
    hint: 'Think recursively: if n is even, is n/2 a power of two? What are your base cases (both true and false)?',
    generated_reason: 'Tests recursive base case identification and negative case handling.',
  },

  // ── DYNAMIC PROGRAMMING (2) ───────────────────────────────────
  {
    id: 'dp-1',
    title: 'Climbing Stairs',
    difficulty: 'easy',
    topic: 'dp',
    description: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2' },
      { input: 'n = 3', output: '3' },
    ],
    test_cases: [
      { input: '2', expected: '2' },
      { input: '3', expected: '3' },
      { input: '10', expected: '89' },
    ],
    hint: 'To reach step n, you could have come from step n-1 or step n-2. How does that relate to the number of ways to reach those steps?',
    generated_reason: 'Entry-level DP — reveals brute force vs memoization tendencies.',
  },
  {
    id: 'dp-2',
    title: 'Coin Change',
    difficulty: 'medium',
    topic: 'dp',
    description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      { input: 'coins = [1,5,11], amount = 15', output: '3' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ],
    test_cases: [
      { input: '[1,5,11]\n15', expected: '3' },
      { input: '[2]\n3', expected: '-1' },
      { input: '[1]\n0', expected: '0' },
    ],
    hint: 'Think about building up a solution from amount=0. For each amount, what is the minimum coins needed? Can you reuse sub-problems?',
    generated_reason: 'Classic bottom-up DP — exposes over-engineering patterns.',
  },

  // ── STRINGS (2) ───────────────────────────────────────────────
  {
    id: 'str-1',
    title: 'Valid Anagram',
    difficulty: 'easy',
    topic: 'strings',
    description: `Given two strings s and t, return true if t is an anagram of s, and false otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    test_cases: [
      { input: 'anagram\nnagaram', expected: 'true' },
      { input: 'rat\ncar', expected: 'false' },
      { input: 'a\nab', expected: 'false' },
    ],
    hint: 'Two strings are anagrams if they have the exact same character frequencies. How can you compute and compare those efficiently?',
    generated_reason: 'String frequency counting — tests hash map intuition.',
  },
  {
    id: 'str-2',
    title: 'Longest Common Prefix',
    difficulty: 'easy',
    topic: 'strings',
    description: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".`,
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"' },
      { input: 'strs = ["dog","racecar","car"]', output: '""' },
    ],
    test_cases: [
      { input: 'flower\nflow\nflight', expected: 'fl' },
      { input: 'dog\nracecar\ncar', expected: '' },
      { input: 'a', expected: 'a' },
    ],
    hint: 'Start with the first string as the prefix. For each subsequent string, what condition might shrink your prefix?',
    generated_reason: 'String iteration — tests off-by-one awareness and loop termination.',
  },

  // ── GRAPHS (1) ────────────────────────────────────────────────
  {
    id: 'graph-1',
    title: 'Number of Islands',
    difficulty: 'medium',
    topic: 'graphs',
    description: `Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

Input: grid as newline-separated rows of space-separated values (1 or 0).`,
    examples: [
      { input: '4 4 grid with 3 islands', output: '3' },
    ],
    test_cases: [
      { input: '1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expected: '1' },
      { input: '1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expected: '3' },
      { input: '0 0 0\n0 0 0', expected: '0' },
    ],
    hint: 'When you find a \'1\', you found an island. What do you need to do to avoid counting parts of the same island multiple times?',
    generated_reason: 'Graph traversal (BFS/DFS) — tests systematic exploration patterns.',
  },

  // ── HASH MAPS (2) ─────────────────────────────────────────────
  {
    id: 'hash-1',
    title: 'Group Anagrams',
    difficulty: 'medium',
    topic: 'hash-maps',
    description: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    test_cases: [
      { input: 'eat\ntea\ntan\nate\nnat\nbat', expected: '3' }, // Number of groups
      { input: '', expected: '1' },
      { input: 'a', expected: '1' },
    ],
    hint: 'Anagrams have the same characters when sorted. What could you use as a key to group them in a hash map?',
    generated_reason: 'Hash map grouping — tests key derivation and aggregation thinking.',
  },
  {
    id: 'hash-2',
    title: 'First Unique Character',
    difficulty: 'easy',
    topic: 'hash-maps',
    description: `Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.`,
    examples: [
      { input: 's = "leetcode"', output: '0' },
      { input: 's = "loveleetcode"', output: '2' },
    ],
    test_cases: [
      { input: 'leetcode', expected: '0' },
      { input: 'loveleetcode', expected: '2' },
      { input: 'aabb', expected: '-1' },
    ],
    hint: 'You need to count character frequencies first, then find the first character with a count of exactly 1. Why do you need two passes?',
    generated_reason: 'Two-pass hash map — tests understanding of when you need multiple scans.',
  },
];

export function getProblemsForUser(weakTopics: string[] = []): Problem[] {
  if (weakTopics.length === 0) return STATIC_PROBLEMS;
  // Sort to surface weak-area problems first
  return [...STATIC_PROBLEMS].sort((a, b) => {
    const aWeak = weakTopics.includes(a.topic) ? -1 : 0;
    const bWeak = weakTopics.includes(b.topic) ? -1 : 0;
    return aWeak - bWeak;
  });
}
