import pytest
import math

class AIEngineMock:
    """Mock implementation of PromptScope AI Core Engines."""
    @staticmethod
    def generate_embeddings(text: str) -> list[float]:
        """Generates mock normalized high-dimensional semantic embeddings."""
        # Simple hash-based embedding simulation for consistency
        words = text.lower().split()
        vector = [0.0] * 64
        for idx, w in enumerate(words):
            val = sum(ord(char) for char in w) / 1000.0
            vector[idx % 64] += val
        
        # Normalize the vector to maintain cosine distance consistency
        magnitude = math.sqrt(sum(x*x for x in vector)) or 1.0
        return [x / magnitude for x in vector]

    @staticmethod
    def calculate_cosine_similarity(v1: list[float], v2: list[float]) -> float:
        """Computes accurate cosine similarity between vectors."""
        dot_product = sum(a * b for a, b in zip(v1, v2))
        m1 = math.sqrt(sum(a*a for a in v1))
        m2 = math.sqrt(sum(b*b for b in v2))
        return dot_product / (m1 * m2) if m1 and m2 else 0.0

    @staticmethod
    def evaluate_prompt_score(text: str, system_instruction: str = "") -> dict:
        """Scores a prompt on major structural vectors."""
        words = text.split()
        word_count = len(words)
        
        clarity = min(100, 40 + word_count * 3)
        specificity = 30 + (25 if "format" in text.lower() or "must" in text.lower() else 0)
        context = 20 + (30 if system_instruction else 0) + (20 if len(text) > 100 else 0)
        
        # Ambiguity threshold deduction for vague terms
        vague_terms = ["some", "maybe", "like", "approximate"]
        ambiguity = max(30, 80 - sum(10 for w in words if w.lower() in vague_terms))
        
        overall = round(clarity * 0.3 + specificity * 0.3 + context * 0.2 + ambiguity * 0.2)
        
        return {
            "score": overall,
            "clarity": clarity,
            "specificity": specificity,
            "context": context,
            "ambiguity": ambiguity
        }

def test_embedding_generation():
    """Verify that generated embeddings are consistent and correctly normalized."""
    text1 = "Optimize this Postgres query for maximum throughput"
    vector1 = AIEngineMock.generate_embeddings(text1)
    
    assert len(vector1) == 64
    # Vector magnitude should be approximately 1.0 (normalized)
    magnitude = math.sqrt(sum(x*x for x in vector1))
    assert pytest.approx(magnitude, 0.001) == 1.0

def test_embedding_similarity():
    """Verify semantic cosine calculations on mock vector sets."""
    prompt_a = "Generate code to print an array in TypeScript"
    prompt_b = "Generate code to write a list in JavaScript"
    prompt_c = "Bake me a warm chocolate cookie cake"
    
    v_a = AIEngineMock.generate_embeddings(prompt_a)
    v_b = AIEngineMock.generate_embeddings(prompt_b)
    v_c = AIEngineMock.generate_embeddings(prompt_c)
    
    sim_ab = AIEngineMock.calculate_cosine_similarity(v_a, v_b)
    sim_ac = AIEngineMock.calculate_cosine_similarity(v_a, v_c)
    
    # Semantic similarity of two tech questions should be higher than a baking recipe
    assert sim_ab > sim_ac
    assert -1.0 <= sim_ab <= 1.0

def test_prompt_scoring_heuristics():
    """Verify heuristics mapping logic scores structural details accurately."""
    poor_prompt = "some query code"
    rich_prompt = "Write a TypeScript function to reverse a linked list. Return valid JSON formatting."
    system_instr = "You are a senior computer science professor."
    
    score_poor = AIEngineMock.evaluate_prompt_score(poor_prompt)
    score_rich = AIEngineMock.evaluate_prompt_score(rich_prompt, system_instr)
    
    assert score_rich["score"] > score_poor["score"]
    assert score_rich["clarity"] > score_poor["clarity"]
    assert score_rich["context"] > score_poor["context"]
    assert score_poor["ambiguity"] < score_rich["ambiguity"] # Vague word "some" penalizes it
