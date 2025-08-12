"""
Error handling and retry mechanisms for the Udyam scraper.
"""
from typing import Callable, TypeVar, Any
import asyncio
from functools import wraps
import logging

T = TypeVar('T')

def setup_logging():
    """Configure logging for the scraper."""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('scraper.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

async def with_retry(
    func: Callable[..., T],
    max_retries: int = 3,
    delay: float = 1.0
) -> T:
    """
    Retry decorator for async functions with exponential backoff.
    """
    logger = setup_logging()
    
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> T:
        last_exception = None
        for attempt in range(max_retries):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                wait_time = delay * (2 ** attempt)
                logger.warning(
                    f"Attempt {attempt + 1}/{max_retries} failed: {str(e)}. "
                    f"Retrying in {wait_time}s..."
                )
                await asyncio.sleep(wait_time)
        
        logger.error(f"All {max_retries} attempts failed")
        raise last_exception
    
    return wrapper
