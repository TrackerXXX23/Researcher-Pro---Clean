#!/usr/bin/env python3
"""
Performance Testing and Benchmarking Script

This script performs various performance tests and benchmarks on the FastAPI backend,
measuring response times, throughput, and resource usage under different loads.
"""

import os
import sys
import time
import asyncio
import aiohttp
import statistics
import psutil
import click
import logging
from typing import List, Dict, Any
from dataclasses import dataclass
from concurrent.futures import ThreadPoolExecutor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class BenchmarkResult:
    """Benchmark result data"""
    endpoint: str
    method: str
    requests: int
    concurrency: int
    duration: float
    min_time: float
    max_time: float
    avg_time: float
    percentile_95: float
    percentile_99: float
    errors: int
    requests_per_second: float
    cpu_usage: float
    memory_usage: float

class Benchmarker:
    def __init__(
        self,
        base_url: str = "http://localhost:8000"
    ):
        self.base_url = base_url
        self.session = None
        self.results: List[BenchmarkResult] = []

    async def setup(self):
        """Set up benchmarking session"""
        self.session = aiohttp.ClientSession()

    async def cleanup(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()

    async def run_benchmark(
        self,
        endpoint: str,
        method: str = "GET",
        requests: int = 1000,
        concurrency: int = 10,
        payload: Dict[str, Any] = None
    ) -> BenchmarkResult:
        """
        Run benchmark for specific endpoint
        """
        logger.info(
            f"Starting benchmark: {method} {endpoint} "
            f"({requests} requests, {concurrency} concurrent)"
        )
        
        # Prepare request coroutines
        url = f"{self.base_url}{endpoint}"
        request_times = []
        errors = 0
        start_time = time.time()
        
        # Track system resources
        process = psutil.Process()
        initial_cpu = process.cpu_percent()
        initial_memory = process.memory_info().rss
        
        async def make_request():
            try:
                request_start = time.time()
                async with self.session.request(
                    method,
                    url,
                    json=payload
                ) as response:
                    await response.read()
                request_time = time.time() - request_start
                request_times.append(request_time)
                return True
            except Exception as e:
                logger.error(f"Request error: {str(e)}")
                nonlocal errors
                errors += 1
                return False
        
        # Create request batches
        tasks = []
        for _ in range(requests):
            tasks.append(make_request())
        
        # Run requests in batches
        for i in range(0, len(tasks), concurrency):
            batch = tasks[i:i + concurrency]
            await asyncio.gather(*batch)
        
        # Calculate results
        end_time = time.time()
        duration = end_time - start_time
        
        if request_times:
            result = BenchmarkResult(
                endpoint=endpoint,
                method=method,
                requests=requests,
                concurrency=concurrency,
                duration=duration,
                min_time=min(request_times),
                max_time=max(request_times),
                avg_time=statistics.mean(request_times),
                percentile_95=statistics.quantiles(request_times, n=20)[18],
                percentile_99=statistics.quantiles(request_times, n=100)[98],
                errors=errors,
                requests_per_second=requests / duration,
                cpu_usage=process.cpu_percent() - initial_cpu,
                memory_usage=(process.memory_info().rss - initial_memory) / 1024 / 1024
            )
        else:
            result = BenchmarkResult(
                endpoint=endpoint,
                method=method,
                requests=requests,
                concurrency=concurrency,
                duration=duration,
                min_time=0,
                max_time=0,
                avg_time=0,
                percentile_95=0,
                percentile_99=0,
                errors=errors,
                requests_per_second=0,
                cpu_usage=0,
                memory_usage=0
            )
        
        self.results.append(result)
        return result

    def print_result(self, result: BenchmarkResult):
        """Print benchmark result"""
        print("\n=== Benchmark Results ===\n")
        print(f"Endpoint: {result.method} {result.endpoint}")
        print(f"Requests: {result.requests}")
        print(f"Concurrency: {result.concurrency}")
        print(f"Duration: {result.duration:.2f}s")
        print(f"Requests/second: {result.requests_per_second:.2f}")
        print("\nResponse Times:")
        print(f"  Min: {result.min_time * 1000:.2f}ms")
        print(f"  Max: {result.max_time * 1000:.2f}ms")
        print(f"  Avg: {result.avg_time * 1000:.2f}ms")
        print(f"  95%: {result.percentile_95 * 1000:.2f}ms")
        print(f"  99%: {result.percentile_99 * 1000:.2f}ms")
        print(f"\nErrors: {result.errors}")
        print("\nResource Usage:")
        print(f"  CPU: {result.cpu_usage:.1f}%")
        print(f"  Memory: {result.memory_usage:.1f}MB")

    async def generate_report(self, output_dir: str = "benchmark_results"):
        """Generate benchmark report"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Generate HTML report
        html_content = """
        <html>
        <head>
            <title>Benchmark Results</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .chart { margin: 20px 0; }
            </style>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
        </head>
        <body>
            <h1>Benchmark Results</h1>
            
            <div id="requestsChart" class="chart"></div>
            <div id="timingChart" class="chart"></div>
            <div id="resourceChart" class="chart"></div>
            
            <h2>Detailed Results</h2>
            <table>
                <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Requests</th>
                    <th>RPS</th>
                    <th>Avg Time</th>
                    <th>95%</th>
                    <th>99%</th>
                    <th>Errors</th>
                    <th>CPU</th>
                    <th>Memory</th>
                </tr>
        """
        
        for result in self.results:
            html_content += f"""
                <tr>
                    <td>{result.endpoint}</td>
                    <td>{result.method}</td>
                    <td>{result.requests}</td>
                    <td>{result.requests_per_second:.2f}</td>
                    <td>{result.avg_time * 1000:.2f}ms</td>
                    <td>{result.percentile_95 * 1000:.2f}ms</td>
                    <td>{result.percentile_99 * 1000:.2f}ms</td>
                    <td>{result.errors}</td>
                    <td>{result.cpu_usage:.1f}%</td>
                    <td>{result.memory_usage:.1f}MB</td>
                </tr>
            """
        
        html_content += """
            </table>
            
            <script>
                // Create charts using Plotly
                const requestsData = {
                    x: ENDPOINTS,
                    y: RPS_VALUES,
                    type: 'bar',
                    name: 'Requests/Second'
                };
                
                Plotly.newPlot('requestsChart', [requestsData], {
                    title: 'Requests per Second by Endpoint'
                });
                
                const timingData = {
                    x: ENDPOINTS,
                    y: AVG_TIMES,
                    type: 'bar',
                    name: 'Average Response Time'
                };
                
                Plotly.newPlot('timingChart', [timingData], {
                    title: 'Average Response Time by Endpoint'
                });
                
                const resourceData = [{
                    x: ENDPOINTS,
                    y: CPU_VALUES,
                    type: 'bar',
                    name: 'CPU Usage'
                }, {
                    x: ENDPOINTS,
                    y: MEMORY_VALUES,
                    type: 'bar',
                    name: 'Memory Usage'
                }];
                
                Plotly.newPlot('resourceChart', resourceData, {
                    title: 'Resource Usage by Endpoint'
                });
            </script>
        </body>
        </html>
        """
        
        # Replace placeholder data
        html_content = html_content.replace(
            "ENDPOINTS",
            str([r.endpoint for r in self.results])
        )
        html_content = html_content.replace(
            "RPS_VALUES",
            str([r.requests_per_second for r in self.results])
        )
        html_content = html_content.replace(
            "AVG_TIMES",
            str([r.avg_time * 1000 for r in self.results])
        )
        html_content = html_content.replace(
            "CPU_VALUES",
            str([r.cpu_usage for r in self.results])
        )
        html_content = html_content.replace(
            "MEMORY_VALUES",
            str([r.memory_usage for r in self.results])
        )
        
        # Save report
        report_path = os.path.join(output_dir, "benchmark_report.html")
        with open(report_path, "w") as f:
            f.write(html_content)
        
        logger.info(f"Benchmark report generated: {report_path}")

@click.group()
def cli():
    """Performance testing and benchmarking tool"""
    pass

@cli.command()
@click.option("--url", default="http://localhost:8000", help="Base URL")
@click.option("--requests", default=1000, help="Number of requests")
@click.option("--concurrency", default=10, help="Concurrent requests")
@click.option("--output", default="benchmark_results", help="Output directory")
def benchmark(url, requests, concurrency, output):
    """Run performance benchmark"""
    async def run():
        benchmarker = Benchmarker(url)
        await benchmarker.setup()
        
        # Test endpoints
        endpoints = [
            ("/api/v1/analysis/start", "POST", {"template": "test"}),
            ("/api/v1/analysis/{id}", "GET", None),
            ("/api/v1/research/collect", "POST", {"query": "test"}),
            ("/api/v1/reports/generate", "POST", {"analysis_id": "test"})
        ]
        
        for endpoint, method, payload in endpoints:
            result = await benchmarker.run_benchmark(
                endpoint,
                method=method,
                requests=requests,
                concurrency=concurrency,
                payload=payload
            )
            benchmarker.print_result(result)
        
        await benchmarker.generate_report(output)
        await benchmarker.cleanup()
    
    asyncio.run(run())

@cli.command()
@click.option("--url", default="http://localhost:8000", help="Base URL")
@click.option("--duration", default=60, help="Test duration in seconds")
@click.option("--users", default=10, help="Simulated users")
def loadtest(url, duration, users):
    """Run load test"""
    print(f"Running load test: {users} users for {duration} seconds")
    # Load test implementation here

if __name__ == "__main__":
    cli()
