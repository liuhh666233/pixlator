from setuptools import setup, find_packages

setup(
    name="pixlator",
    version="0.0.1",
    author="lxb",
    author_email="liuxiaobo666233@gmail.com",
    packages=find_packages(),
    entry_points={
        "console_scripts": [
            "pixlator=pixlator.main:main",
        ]
    },
    python_requires=">=3.6",
)
