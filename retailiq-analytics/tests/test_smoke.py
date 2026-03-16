def test_health_check():
    """Basic smoke test to ensure the test suite is running."""
    assert True

def test_imports():
    """Verify that the main application components can be imported."""
    import sys
    import os
    # Add parent directory to sys.path to allow importing main
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    
    try:
        import main
        assert main is not None
    except ImportError as e:
        import pytest
        pytest.fail(f"Failed to import main: {e}")
