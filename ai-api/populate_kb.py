from rag_service import add_document_to_kb

faqs = [
    "Nobel Mount College is a leading IT college in Yangon, Myanmar, offering advanced courses in AI, software engineering, and web development.",
    "The fees for the Web Development Bootcamp at Nobel Mount College are $800. The course duration is 3 months.",
    "The fees for the AI & Machine Learning Specialization at Nobel Mount College are $1,200. The course duration is 4 months.",
    "Our campus is located at No. 123, Pyay Road, Hlaing Township, Yangon.",
    "Classes are available in both online and in-person formats. Weekend batches are also available for working professionals.",
    "You can contact us via phone at 09-123456789 or email at info@nobelmount.edu.mm.",
    "We provide 100% job placement assistance for all our graduates through our partner tech companies in Singapore and Myanmar."
]

print("Populating Knowledge Base...")
for faq in faqs:
    add_document_to_kb(faq)
print("Done!")
